import { recreateTransform } from '@fellow/prosemirror-recreate-transform';
import { ChangeSet, simplifyChanges } from '@tiptap/pm/changeset';
import type { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model';

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
 * Diff two documents that share a schema into replaced regions.
 *
 * The backend stores version snapshots, not editing steps, so steps are first
 * recreated (recreateTransform), condensed into replaced ranges
 * (prosemirror-changeset), then merged to word boundaries for presentation.
 * Alignment runs on id-stripped copies; since attrs never change a node's
 * size, the resulting positions are valid in the real documents. Changes are
 * ascending and non-overlapping. Formatting-only changes produce no regions:
 * the changeset tracks content, not marks.
 */
export function computeNoteDiffChanges(
  schema: Schema,
  older: ProseMirrorNode,
  newer: ProseMirrorNode
): readonly NoteDiffChange[] {
  const docA = alignmentDoc(schema, older);
  const docB = alignmentDoc(schema, newer);

  const tr = recreateTransform(docA, docB, { complexSteps: true, wordDiffs: true });
  const changeSet = ChangeSet.create(docA).addSteps(tr.doc, tr.mapping.maps, 0);
  const changes = simplifyChanges(changeSet.changes, docB);

  return changes.map(({ fromA, toA, fromB, toB }) => ({ fromA, toA, fromB, toB }));
}
