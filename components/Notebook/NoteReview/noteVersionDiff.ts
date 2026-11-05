import { recreateTransform } from '@fellow/prosemirror-recreate-transform';
import { ChangeSet, simplifyChanges, type TokenEncoder } from '@tiptap/pm/changeset';
import type { Mark, Node as ProseMirrorNode, Schema } from '@tiptap/pm/model';
import { AddMarkStep, RemoveMarkStep, StepMap, type Transform } from '@tiptap/pm/transform';

/**
 * Node types the editor's UniqueID extension stamps `id` attrs onto (see
 * extension-kit.ts). Ids are volatile across writers — the assistant rebuilds
 * content server-side without preserving them — so on otherwise identical
 * nodes they'd register as a change and must not take part in the diff.
 */
const UNIQUE_ID_TYPES = new Set(['paragraph', 'heading', 'blockquote', 'codeBlock', 'table']);

interface JsonNode {
  readonly type?: string;
  readonly attrs?: Readonly<Record<string, unknown>>;
  readonly content?: readonly JsonNode[];
  readonly [key: string]: unknown;
}

/**
 * One changed region between two versions of a document: [fromA, toA) in the
 * older document was replaced by [fromB, toB) in the newer one. Either side
 * may be empty (a pure insertion or a pure removal, never both).
 */
export interface NoteDiffChange {
  readonly fromA: number;
  readonly toA: number;
  readonly fromB: number;
  readonly toB: number;
}

function stripUniqueIds(node: JsonNode): JsonNode {
  let next = node;
  if (next.type != null && UNIQUE_ID_TYPES.has(next.type) && next.attrs && 'id' in next.attrs) {
    const attrs = { ...next.attrs };
    delete attrs.id;
    next = { ...next, attrs };
  }
  if (next.content != null && next.content.length > 0) {
    next = { ...next, content: next.content.map(stripUniqueIds) };
  }
  return next;
}

/** A copy of the document with volatile ids dropped, used only for alignment. */
function alignmentDoc(schema: Schema, doc: ProseMirrorNode): ProseMirrorNode {
  return schema.nodeFromJSON(stripUniqueIds(doc.toJSON()));
}

/**
 * Mark-set fingerprints cached on the mark arrays themselves — ProseMirror
 * hands the same array to every character of a text node, so each stringify
 * runs once per node rather than once per character.
 */
const markFingerprints = new WeakMap<readonly Mark[], string>();

function marksFingerprint(marks: readonly Mark[]): string {
  let fingerprint = markFingerprints.get(marks);
  if (fingerprint === undefined) {
    fingerprint = marks.map((mark) => mark.type.name + JSON.stringify(mark.attrs)).join('\u0001');
    markFingerprints.set(marks, fingerprint);
  }
  return fingerprint;
}

/**
 * Token identity for diffing. The library's default encoder compares text by
 * character code and nodes by type name alone, so versions differing only in
 * marks (bold, links) or attrs (heading level, image src) diff to zero
 * regions and the review adopts the incoming side wholesale — erasing, for
 * example, formatting the user applied while the assistant was writing.
 * Folding marks and attrs into the tokens makes those differences ordinary
 * reviewable changes. Volatile ids never reach this encoder: the alignment
 * docs drop them first.
 */
const formattingAwareEncoder: TokenEncoder<number | string> = {
  encodeCharacter: (char, marks) =>
    marks.length === 0 ? char : `${char}\u0001${marksFingerprint(marks)}`,
  encodeNodeStart: (node) =>
    `${node.type.name}\u0001${JSON.stringify(node.attrs)}\u0001${marksFingerprint(node.marks)}`,
  encodeNodeEnd: (node) => `/${node.type.name}`,
  compareTokens: (a, b) => a === b,
};

/**
 * Per-step maps for the changeset, with mark steps made visible. Mark steps
 * move no positions, so their real step maps are empty and the changeset
 * would never compare the ranges they touch; substitute a same-size map over
 * the marked range so those tokens get diffed — with the formatting-aware
 * encoder — like any other edit.
 */
function coverageMaps(tr: Transform): readonly StepMap[] {
  return tr.steps.map((step, index) =>
    step instanceof AddMarkStep || step instanceof RemoveMarkStep
      ? new StepMap([step.from, step.to - step.from, step.to - step.from])
      : tr.mapping.maps[index]
  );
}

/**
 * Move a position to the outer edge of its enclosing textblock (paragraph,
 * heading, code block). Positions between blocks — parent is the doc or a
 * wrapper like a list item — stay put.
 */
function blockStart(doc: ProseMirrorNode, pos: number): number {
  const $pos = doc.resolve(pos);
  return $pos.parent.isTextblock ? $pos.before($pos.depth) : pos;
}

function blockEnd(doc: ProseMirrorNode, pos: number): number {
  const $pos = doc.resolve(pos);
  return $pos.parent.isTextblock ? $pos.after($pos.depth) : pos;
}

/**
 * Widen each changed region to whole blocks, merging regions whose widened
 * ranges overlap (several edits inside one paragraph become one change).
 * The widened prefix and suffix are identical text on both sides — outside
 * a change the documents align — so every pair keeps the changeset
 * invariant that [fromA, toA) was replaced by [fromB, toB). A side left
 * sitting between blocks (a purely inserted or purely removed block) stays
 * degenerate: there is nothing on that side to widen over.
 */
function expandChangesToBlocks(
  docA: ProseMirrorNode,
  docB: ProseMirrorNode,
  changes: readonly NoteDiffChange[]
): readonly NoteDiffChange[] {
  const merged: Array<{ fromA: number; toA: number; fromB: number; toB: number }> = [];
  for (const change of changes) {
    const fromA = blockStart(docA, change.fromA);
    const toA = blockEnd(docA, change.toA);
    const fromB = blockStart(docB, change.fromB);
    const toB = blockEnd(docB, change.toB);
    const last = merged[merged.length - 1];
    if (last && (fromA < last.toA || fromB < last.toB)) {
      last.toA = Math.max(last.toA, toA);
      last.toB = Math.max(last.toB, toB);
    } else {
      merged.push({ fromA, toA, fromB, toB });
    }
  }
  return merged;
}

/**
 * Diff two documents that share a schema into replaced regions.
 *
 * The backend stores version snapshots, not editing steps, so steps are first
 * recreated (recreateTransform), condensed into replaced ranges
 * (prosemirror-changeset), then widened to whole blocks for review: a change
 * anywhere inside a paragraph presents the entire old block against the
 * entire new one, and edits meeting inside one block merge into a single
 * region. Alignment runs on id-stripped copies; since attrs never change a
 * node's size, the resulting positions are valid in the real documents.
 * Changes are ascending and non-overlapping. Marks and attrs take part in
 * token identity (see formattingAwareEncoder), so formatting-only edits are
 * real regions; only the volatile ids are exempt.
 */
export function computeNoteDiffChanges(
  schema: Schema,
  older: ProseMirrorNode,
  newer: ProseMirrorNode
): readonly NoteDiffChange[] {
  const docA = alignmentDoc(schema, older);
  const docB = alignmentDoc(schema, newer);

  const tr = recreateTransform(docA, docB, { complexSteps: true, wordDiffs: true });
  const changeSet = ChangeSet.create(docA, undefined, formattingAwareEncoder).addSteps(
    tr.doc,
    coverageMaps(tr),
    0
  );
  const changes = simplifyChanges(changeSet.changes, docB);

  return expandChangesToBlocks(
    docA,
    docB,
    changes.map(({ fromA, toA, fromB, toB }) => ({ fromA, toA, fromB, toB }))
  );
}
