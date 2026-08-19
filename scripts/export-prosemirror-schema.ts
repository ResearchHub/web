/**
 * Exports the ProseMirror schemas implied by our TipTap extension sets as JSON
 * specs the backend can load (e.g. with prosemirror-py's `Schema(spec)`), so
 * server-side code can validate, read, and write editor documents against the
 * exact same schema the frontend enforces.
 *
 * Run with: npm run schema:export
 *
 * One file is written per editor surface to schemas/prosemirror/:
 *   - block-editor.json    components/Editor (notebook + posts)
 *   - comment-editor.json  components/Comment (incl. review-mode nodes)
 *
 * Only the schema-relevant parts of each spec survive serialization:
 * DOM-oriented fields (`toDOM`/`parseDOM`/`toDebugString`) are stripped, plus
 * `leafText` (model-level, but a function and unset by our extensions), and
 * JSON.stringify drops any other function-valued field (e.g. TipTap's
 * `toText`) natively. Attribute `default`s must be JSON-serializable — the
 * script fails loudly if one isn't, because silently dropping a default would
 * turn an optional attribute into a required one.
 *
 * Output is deterministic (schema order, 2-space indent) so regenerating with
 * no extension changes yields a byte-identical file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getSchema } from '@tiptap/core';
import type { AttributeSpec, Schema } from '@tiptap/pm/model';

import { ExtensionKit } from '@/components/Editor/extensions/extension-kit';
import { AiImage, AiWriter } from '@/components/Editor/extensions';
import { getCommentEditorExtensions } from '@/components/Comment/lib/commentEditorExtensions';

const OUTPUT_DIR = path.join(__dirname, '..', 'schemas', 'prosemirror');

const STRIPPED_KEYS = new Set(['parseDOM', 'toDOM', 'toDebugString', 'leafText']);

/**
 * One NodeSpec/MarkSpec with stripped keys removed and attribute defaults made
 * JSON-safe. In ProseMirror an attribute is optional iff its spec has a
 * `default` property, so a default JSON.stringify would drop must fail loudly
 * instead of silently making the attribute required. `default: undefined`
 * (optional; the attr is simply omitted from serialized nodes, e.g.
 * imageBlock.alt) becomes `default: null`, which JSON can represent.
 */
function sanitizeSpec(typeName: string, spec: object): Record<string, unknown> {
  const clean: Record<string, unknown> = Object.fromEntries(
    Object.entries(spec).filter(([key]) => !STRIPPED_KEYS.has(key))
  );

  const attrs = clean.attrs as Record<string, AttributeSpec> | undefined;
  if (attrs) {
    clean.attrs = Object.fromEntries(
      Object.entries(attrs).map(([attrName, attrSpec]) => {
        if (!('default' in attrSpec)) return [attrName, attrSpec];
        if (attrSpec.default === undefined) return [attrName, { ...attrSpec, default: null }];
        if (JSON.stringify(attrSpec.default) === undefined) {
          throw new Error(
            `Attribute default for "${typeName}.${attrName}" is not JSON-serializable ` +
              `(${typeof attrSpec.default}); dropping it would make the attribute required.`
          );
        }
        return [attrName, attrSpec];
      })
    );
  }

  return clean;
}

/** Serializes a schema to a plain-JSON spec, preserving schema order. */
function schemaToJsonSpec(schema: Schema): Record<string, unknown> {
  const sanitizeAll = (specs: Record<string, object>, kind: string) =>
    Object.fromEntries(
      Object.entries(specs).map(([name, spec]) => [name, sanitizeSpec(`${kind}.${name}`, spec)])
    );
  return {
    topNode: schema.topNodeType.name,
    nodes: sanitizeAll(schema.spec.nodes.toObject(), 'nodes'),
    marks: sanitizeAll(schema.spec.marks.toObject(), 'marks'),
  };
}

/** Guards against values JSON.stringify would silently corrupt into null. */
function replacer(key: string, value: unknown): unknown {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`Non-finite number under key "${key}"`);
  }
  return value;
}

const schemas = {
  // The block editor registers AiWriter/AiImage only when AI is enabled, but a
  // document autosaved mid-generation can contain their nodes, so the exported
  // schema includes them. Note: the editable notebook editor swaps `doc` for a
  // stricter `heading block+` variant (see useBlockEditor); this export keeps
  // the permissive default so it accepts every document the app can persist.
  'block-editor': getSchema([...ExtensionKit({}), AiWriter, AiImage]),
  // Review mode adds the sectionHeader node; exporting with it included makes
  // the schema a superset covering both generic comments and reviews.
  'comment-editor': getSchema(getCommentEditorExtensions({ isReview: true })),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
for (const [name, schema] of Object.entries(schemas)) {
  const outPath = path.join(OUTPUT_DIR, `${name}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(schemaToJsonSpec(schema), replacer, 2)}\n`);
  const nodeCount = Object.keys(schema.nodes).length;
  const markCount = Object.keys(schema.marks).length;
  console.log(
    `Wrote ${path.relative(process.cwd(), outPath)} (${nodeCount} nodes, ${markCount} marks)`
  );
}
