import type { Editor } from '@tiptap/core';
import { Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import type { NoteDiffSpan } from './noteVersionDiff';

const INSERTED_CLASS = 'rounded-sm bg-emerald-100 box-decoration-clone text-emerald-950';
const DELETED_CLASS =
  'rounded-sm bg-red-50 box-decoration-clone text-red-800 line-through decoration-red-400/70 cursor-pointer hover:bg-red-100';

/** A diff span with live positions, mapped along as the user keeps editing. */
type LiveSpan = { readonly id: number } & NoteDiffSpan;

interface OverlayState {
  readonly spans: readonly LiveSpan[];
  readonly decorations: DecorationSet;
}

interface OverlayMeta {
  readonly resolvedId: number;
}

const overlayKey = new PluginKey<OverlayState>('noteDiffOverlay');

function restoreSpan(view: EditorView, id: number): void {
  const state = overlayKey.getState(view.state);
  const span = state?.spans.find((candidate) => candidate.id === id);
  if (!span || span.kind !== 'deleted') return;
  const slice = Slice.fromJSON(view.state.schema, span.slice);
  const tr = view.state.tr.replace(span.pos, span.pos, slice);
  tr.setMeta(overlayKey, { resolvedId: id } satisfies OverlayMeta);
  view.dispatch(tr);
}

function deletedWidget(span: LiveSpan & { kind: 'deleted' }) {
  return (view: EditorView) => {
    const del = document.createElement('del');
    del.className = DELETED_CLASS;
    del.title = 'Removed by the assistant — click to restore';
    // Safe by construction: the html comes out of DOMSerializer over a
    // schema-parsed document — the same pipeline that renders the editor.
    del.innerHTML = span.html;
    del.addEventListener('mousedown', (event) => event.preventDefault());
    del.addEventListener('click', (event) => {
      event.preventDefault();
      restoreSpan(view, span.id);
    });
    return del;
  };
}

function buildDecorations(doc: ProseMirrorNode, spans: readonly LiveSpan[]): DecorationSet {
  const decorations = spans.map((span) =>
    span.kind === 'inserted'
      ? Decoration.inline(span.from, span.to, { class: INSERTED_CLASS })
      : // side: -1 puts removed content before whatever replaced it.
        Decoration.widget(span.pos, deletedWidget(span), { side: -1 })
  );
  return DecorationSet.create(doc, decorations);
}

/**
 * Map a span through a document change; null when its anchor was edited away
 * (an insertion fully deleted, a removal marker caught in a replacement).
 */
function mapSpan(span: LiveSpan, tr: Transaction): LiveSpan | null {
  if (span.kind === 'inserted') {
    const from = tr.mapping.map(span.from, 1);
    const to = tr.mapping.map(span.to, -1);
    return from < to ? { ...span, from, to } : null;
  }
  const result = tr.mapping.mapResult(span.pos, -1);
  return result.deleted ? null : { ...span, pos: result.pos };
}

/**
 * The in-note review overlay: the editor shows the assistant's version as the
 * real, editable document; this plugin paints what changed against the
 * reader's previous document. Inserted ranges are highlighted, removed
 * content is struck through in place and restored by clicking it. The
 * document itself carries no diff state, so autosave keeps saving plain
 * content throughout the review.
 */
function buildOverlayPlugin(spans: readonly NoteDiffSpan[]): Plugin<OverlayState> {
  const initial: LiveSpan[] = spans.map((span, index) => ({ ...span, id: index }));
  return new Plugin<OverlayState>({
    key: overlayKey,
    state: {
      init: (_config, state) => ({
        spans: initial,
        decorations: buildDecorations(state.doc, initial),
      }),
      apply: (tr, previous) => {
        const meta = tr.getMeta(overlayKey) as OverlayMeta | undefined;
        let spans = previous.spans;
        if (meta != null) {
          spans = spans.filter((span) => span.id !== meta.resolvedId);
        }
        if (!tr.docChanged && spans === previous.spans) return previous;
        if (tr.docChanged) {
          spans = spans
            .map((span) => mapSpan(span, tr))
            .filter((span): span is LiveSpan => span != null);
        }
        return { spans, decorations: buildDecorations(tr.doc, spans) };
      },
    },
    props: {
      decorations(state) {
        return overlayKey.getState(state)?.decorations;
      },
    },
  });
}

export function installNoteDiffOverlay(editor: Editor, spans: readonly NoteDiffSpan[]): void {
  editor.unregisterPlugin(overlayKey);
  editor.registerPlugin(buildOverlayPlugin(spans));
}

export function uninstallNoteDiffOverlay(editor: Editor | null): void {
  if (!editor || editor.isDestroyed) return;
  editor.unregisterPlugin(overlayKey);
}
