import { recreateTransform } from '@fellow/prosemirror-recreate-transform';
import { ChangeSet, simplifyChanges } from '@tiptap/pm/changeset';
import { DOMSerializer, type Node as ProseMirrorNode, type Schema } from '@tiptap/pm/model';

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

/** A run of content present in the newer document only. */
export interface InsertedDiffSpan {
  readonly kind: 'inserted';
  readonly from: number;
  readonly to: number;
}

/** Content removed since the older document, anchored where it used to sit. */
export interface DeletedDiffSpan {
  readonly kind: 'deleted';
  /** Position in the newer document. */
  readonly pos: number;
  /** The removed content, serialized through the editor schema, for display. */
  readonly html: string;
  /** The removed slice as JSON, so a click can put it back. */
  readonly slice: unknown;
}

export type NoteDiffSpan = InsertedDiffSpan | DeletedDiffSpan;

export interface NoteDiff {
  /** Positions refer to the newer document. */
  readonly spans: readonly NoteDiffSpan[];
  /** Changed regions after presentational merging; a replacement counts once. */
  readonly changeCount: number;
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

function sliceHtml(
  serializer: DOMSerializer,
  doc: ProseMirrorNode,
  from: number,
  to: number
): string {
  const container = document.createElement('div');
  container.appendChild(serializer.serializeFragment(doc.slice(from, to).content));
  return container.innerHTML;
}

/**
 * Diff two documents that share a schema into highlight spans against the
 * newer one.
 *
 * The backend stores version snapshots, not editing steps, so steps are first
 * recreated (recreateTransform), condensed into replaced ranges
 * (prosemirror-changeset), then merged to word boundaries for presentation.
 * Alignment runs on id-stripped copies; since attrs never change a node's
 * size, the resulting positions are valid in the real documents, and deleted
 * slices are cut from the real older document so restoring them brings the
 * original nodes back. Formatting-only changes produce no spans: the
 * changeset tracks content, not marks.
 */
export function computeNoteDiff(
  schema: Schema,
  older: ProseMirrorNode,
  newer: ProseMirrorNode
): NoteDiff {
  const docA = alignmentDoc(schema, older);
  const docB = alignmentDoc(schema, newer);

  const tr = recreateTransform(docA, docB, { complexSteps: true, wordDiffs: true });
  const changeSet = ChangeSet.create(docA).addSteps(tr.doc, tr.mapping.maps, 0);
  const changes = simplifyChanges(changeSet.changes, docB);

  const serializer = DOMSerializer.fromSchema(schema);
  const spans: NoteDiffSpan[] = [];
  for (const change of changes) {
    if (change.fromA < change.toA) {
      spans.push({
        kind: 'deleted',
        pos: change.fromB,
        html: sliceHtml(serializer, older, change.fromA, change.toA),
        slice: older.slice(change.fromA, change.toA).toJSON(),
      });
    }
    if (change.fromB < change.toB) {
      spans.push({ kind: 'inserted', from: change.fromB, to: change.toB });
    }
  }

  return { spans, changeCount: changes.length };
}
