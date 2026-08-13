import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection, type Transaction } from '@tiptap/pm/state';
import { Transform } from '@tiptap/pm/transform';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { computeNoteDiffChanges, type NoteDiffChange } from './noteVersionDiff';

const INSERTED_CLASS = 'rounded-sm bg-emerald-100 box-decoration-clone text-emerald-950';
const REMOVED_CLASS =
  'rounded-sm bg-red-50 box-decoration-clone text-red-800 line-through decoration-red-400/70';

/**
 * A live region of the review document. Both kinds are real, editable
 * content: `removed` is the reader's overwritten content spliced back in
 * (struck through), `inserted` is what the assistant added (highlighted).
 * Positions are mapped along as the user keeps editing; `changeId` groups the
 * removed/inserted pair born from one changed region.
 */
interface LiveSpan {
  readonly changeId: number;
  readonly kind: 'inserted' | 'removed';
  readonly from: number;
  readonly to: number;
}

/**
 * One review's channel to its host, shared by reference between the plugin
 * state and teardown. Closing it silences any count still waiting on a
 * microtask — after that only the closing zero may speak — and
 * `lastDelivered` records what the host actually heard (seeded with what
 * begin() returned), which is what the closing zero must undo.
 */
interface OverlaySession {
  readonly onChangeCountUpdate?: (count: number) => void;
  lastDelivered: number;
  closed: boolean;
}

interface OverlayState {
  readonly spans: readonly LiveSpan[];
  readonly changeCount: number;
  readonly decorations: DecorationSet;
  readonly session: OverlaySession;
}

interface OverlayOptions {
  /**
   * The number of unresolved changed regions shifted — the user edited a
   * whole region away, or a resolution deleted one side of every pair.
   * Delivered on a microtask, never during a dispatch.
   */
  readonly onChangeCountUpdate?: (count: number) => void;
}

const overlayKey = new PluginKey<OverlayState>('noteDiffOverlay');

function countChanges(spans: readonly LiveSpan[]): number {
  return new Set(spans.map((span) => span.changeId)).size;
}

/**
 * Deliver a live count on a microtask, never during a dispatch. A session
 * closed before delivery stays quiet: the dispatch that moved the count was
 * part of closing (or replacing) the review, and teardown owns the final
 * word — publishing regardless would let a folded review's dying zero
 * dismiss its replacement's controls.
 */
function publishCount(session: OverlaySession, count: number): void {
  const callback = session.onChangeCountUpdate;
  if (!callback) return;
  queueMicrotask(() => {
    if (session.closed) return;
    session.lastDelivered = count;
    callback(count);
  });
}

function buildDecorations(doc: ProseMirrorNode, spans: readonly LiveSpan[]): DecorationSet {
  const decorations = spans.map((span) =>
    span.kind === 'inserted'
      ? Decoration.inline(span.from, span.to, {
          class: INSERTED_CLASS,
          title: 'Added by the assistant',
        })
      : Decoration.inline(span.from, span.to, {
          class: REMOVED_CLASS,
          title: 'Removed by the assistant',
        })
  );
  return DecorationSet.create(doc, decorations);
}

/**
 * Map a span through a document change; null once it has been edited away.
 *
 * Inserted spans are inclusive on both edges, so typing at either boundary
 * joins the assistant's section; removed spans are exclusive, so at the
 * shared removed→inserted boundary the inserted side wins and text typed
 * right before struck content stays neutral. Neutral text survives both
 * Accept and Reject; text inside a section shares its section's fate.
 */
function mapSpan(span: LiveSpan, tr: Transaction): LiveSpan | null {
  const inclusive = span.kind === 'inserted';
  const from = tr.mapping.map(span.from, inclusive ? -1 : 1);
  const to = tr.mapping.map(span.to, inclusive ? 1 : -1);
  return from < to ? { ...span, from, to } : null;
}

/**
 * The in-note review: the document itself is the merge of both versions —
 * the assistant's version with the reader's overwritten content spliced back
 * in — and this plugin tracks which ranges belong to which side. Everything
 * stays editable throughout; edits inside a range grow that range. The
 * merged document must never be persisted as-is: saves go through
 * noteDiffPersistableDoc, which strips the removed (struck) ranges so the
 * server only ever sees the accept-projection.
 */
function buildOverlayPlugin(
  initial: readonly LiveSpan[],
  options: OverlayOptions
): Plugin<OverlayState> {
  const session: OverlaySession = {
    onChangeCountUpdate: options.onChangeCountUpdate,
    // What begin() reports synchronously — the host's starting knowledge.
    lastDelivered: countChanges(initial),
    closed: false,
  };
  return new Plugin<OverlayState>({
    key: overlayKey,
    state: {
      init: (_config, state) => ({
        spans: initial,
        changeCount: countChanges(initial),
        decorations: buildDecorations(state.doc, initial),
        session,
      }),
      apply: (tr, previous) => {
        if (!tr.docChanged) return previous;
        const spans = previous.spans
          .map((span) => mapSpan(span, tr))
          .filter((span): span is LiveSpan => span != null);
        const changeCount = countChanges(spans);
        if (changeCount !== previous.changeCount) {
          publishCount(previous.session, changeCount);
        }
        return {
          spans,
          changeCount,
          decorations: buildDecorations(tr.doc, spans),
          session: previous.session,
        };
      },
    },
    props: {
      decorations(state) {
        return overlayKey.getState(state)?.decorations;
      },
    },
  });
}

/**
 * Map a position in the pre-review document to the merged review document.
 * Neutral text shifts by the surrounding regions' size drift; a position
 * inside overwritten content lands inside its struck (removed) range.
 */
function mapOlderPosToMerged(
  pos: number,
  changes: readonly NoteDiffChange[],
  removedSizes: readonly number[]
): number {
  let drift = 0; // newer-doc position minus older-doc position, after processed regions
  let removedBefore = 0; // merged-doc size of removed content spliced in before this point
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    if (pos < change.fromA) break;
    if (pos <= change.toA) {
      return change.fromB + removedBefore + Math.min(pos - change.fromA, removedSizes[i]);
    }
    drift = change.toB - change.toA;
    removedBefore += removedSizes[i];
  }
  return pos + drift + removedBefore;
}

function dispatchSilently(editor: Editor, tr: Transaction): void {
  // Programmatic content application: not an undo step, not a user edit —
  // autosave and the dirty tracking must not fire for it.
  tr.setMeta('addToHistory', false);
  tr.setMeta('preventUpdate', true);
  editor.view.dispatch(tr);
}

/**
 * Turn an incoming assistant version into an in-note review on the live
 * editor. The document becomes the assistant's version with every piece of
 * content it overwrote spliced back in as struck-through, still-editable
 * text; the selection is carried over so this can fire mid-keystroke.
 *
 * Returns the number of changed regions. Zero means nothing reviewable: the
 * incoming version differed at most in formatting (marks are invisible to
 * the changeset), which is applied verbatim — no overlay is installed.
 *
 * If a review is already active it is first folded back to the reader's
 * side (reject semantics), so the new diff is always mine-vs-latest rather
 * than a diff against a half-merged document.
 */
export function beginNoteDiffReview(
  editor: Editor,
  incoming: ProseMirrorNode,
  options: OverlayOptions = {}
): number {
  resolveNoteDiffReview(editor, 'reject');

  const older = editor.state.doc;
  const selectionHead = editor.state.selection.head;
  const changes = computeNoteDiffChanges(editor.schema, older, incoming);

  if (changes.length === 0) {
    if (!older.eq(incoming)) {
      const tr = editor.state.tr;
      tr.replaceWith(0, older.content.size, incoming.content);
      const pos = Math.min(selectionHead, tr.doc.content.size);
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
      dispatchSilently(editor, tr);
    }
    return 0;
  }

  const tr = editor.state.tr;
  tr.replaceWith(0, older.content.size, incoming.content);

  // Splice each overwritten slice back in at the position that replaced it,
  // descending so earlier positions stay valid. Sizes are measured from the
  // document because fitting an open slice can resize it.
  const removedSizes: number[] = new Array(changes.length).fill(0);
  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i];
    if (change.toA <= change.fromA) continue;
    const slice = older.slice(change.fromA, change.toA);
    const sizeBefore = tr.doc.content.size;
    tr.replace(change.fromB, change.fromB, slice);
    removedSizes[i] = tr.doc.content.size - sizeBefore;
  }

  const spans: LiveSpan[] = [];
  let spliced = 0;
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const removedFrom = change.fromB + spliced;
    spliced += removedSizes[i];
    if (removedSizes[i] > 0) {
      spans.push({
        changeId: i,
        kind: 'removed',
        from: removedFrom,
        to: removedFrom + removedSizes[i],
      });
    }
    const insertedFrom = change.fromB + spliced;
    const insertedTo = change.toB + spliced;
    if (insertedTo > insertedFrom) {
      spans.push({ changeId: i, kind: 'inserted', from: insertedFrom, to: insertedTo });
    }
  }

  const mapped = mapOlderPosToMerged(selectionHead, changes, removedSizes);
  const pos = Math.max(0, Math.min(mapped, tr.doc.content.size));
  tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
  dispatchSilently(editor, tr);

  editor.unregisterPlugin(overlayKey);
  editor.registerPlugin(buildOverlayPlugin(spans, options));
  return changes.length;
}

/**
 * Unregister the overlay and settle what the change-count listener is told.
 * The session closes first, silencing any count still waiting on a
 * microtask (see publishCount). The closing zero is then owed whenever the
 * host last heard a nonzero count — judged from `lastDelivered`, not the
 * document, because resolution alone can leave the live count untouched
 * (accepting keeps a pair's inserted span, rejecting keeps its removed
 * one). The zero itself stays quiet when a new overlay is already installed
 * by the time its microtask runs: the review was replaced (begin folding
 * into a newer version), not closed, and the caller already holds the
 * replacement's count.
 */
function teardownOverlay(editor: Editor): void {
  const state = overlayKey.getState(editor.state);
  editor.unregisterPlugin(overlayKey);
  if (!state) return;
  const { session } = state;
  session.closed = true;
  const callback = session.onChangeCountUpdate;
  if (callback && session.lastDelivered > 0) {
    queueMicrotask(() => {
      if (overlayKey.getState(editor.state)) return;
      callback(0);
    });
  }
}

/**
 * Resolve an active review in place: Accept deletes the struck (removed)
 * ranges, Reject deletes the inserted ones. Everything else — including
 * whatever the user typed while reviewing — stays exactly where it is, and
 * text typed inside a range shares that range's fate. Returns false when no
 * review is active.
 */
export function resolveNoteDiffReview(
  editor: Editor | null,
  decision: 'accept' | 'reject'
): boolean {
  if (!editor || editor.isDestroyed) return false;
  const state = overlayKey.getState(editor.state);
  if (!state) return false;
  const losingKind = decision === 'accept' ? 'removed' : 'inserted';
  const losing = state.spans
    .filter((span) => span.kind === losingKind)
    .sort((a, b) => b.from - a.from);
  if (losing.length > 0) {
    const tr = editor.state.tr;
    for (const span of losing) {
      tr.delete(span.from, span.to);
    }
    dispatchSilently(editor, tr);
  }
  teardownOverlay(editor);
  return true;
}

/** Take the overlay down without touching the document (unmount cleanup). */
export function endNoteDiffReview(editor: Editor | null): void {
  if (!editor || editor.isDestroyed) return;
  teardownOverlay(editor);
}

/**
 * The document a save should persist. While a review is active the editor
 * holds the merged document, whose struck ranges are content the assistant's
 * version — the server's newest — already dropped; persisting them would
 * resurrect content nobody chose. Strips them so saves always write the
 * accept-projection; the reader's side becomes durable through the explicit
 * save on Reject. Null when no review is active (persist the document as-is).
 */
export function noteDiffPersistableDoc(editor: Editor | null): ProseMirrorNode | null {
  if (!editor || editor.isDestroyed) return null;
  const state = overlayKey.getState(editor.state);
  if (!state) return null;
  const removed = state.spans
    .filter((span) => span.kind === 'removed')
    .sort((a, b) => b.from - a.from);
  if (removed.length === 0) return editor.state.doc;
  const transform = new Transform(editor.state.doc);
  for (const span of removed) {
    transform.delete(span.from, span.to);
  }
  return transform.doc;
}
