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
 * Only the schema-relevant parts of each spec survive serialization: DOM
 * concerns (`toDOM`/`parseDOM`/`leafText`/`toDebugString`) are stripped, and
 * any other function-valued field is dropped. Attribute `default`s must be
 * JSON-serializable — the script fails loudly if one isn't, because silently
 * dropping a default would turn an optional attribute into a required one.
 *
 * Output is deterministic (schema order, 2-space indent) so regenerating with
 * no extension changes yields a byte-identical file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getSchema } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';

import { ExtensionKit } from '@/components/Editor/extensions/extension-kit';
import { AiImage, AiWriter } from '@/components/Editor/extensions';
import { getCommentEditorExtensions } from '@/components/Comment/lib/commentEditorExtensions';

const OUTPUT_DIR = path.join(__dirname, '..', 'schemas', 'prosemirror');

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** Spec fields that only make sense with a DOM; meaningless to the backend. */
const DOM_ONLY_KEYS = new Set(['parseDOM', 'toDOM', 'toDebugString', 'leafText']);

/** Deep-copies a spec value, dropping functions and undefined. */
function sanitizeValue(value: unknown, atPath: string): JsonValue | undefined {
  if (value === null) return null;
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return value;
    case 'number':
      if (!Number.isFinite(value)) {
        throw new Error(`Non-finite number at ${atPath}`);
      }
      return value;
    case 'function':
    case 'undefined':
      return undefined;
    case 'object': {
      if (Array.isArray(value)) {
        return value
          .map((item, i) => sanitizeValue(item, `${atPath}[${i}]`))
          .filter((item): item is JsonValue => item !== undefined);
      }
      const out: { [key: string]: JsonValue } = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        const sanitized = sanitizeValue(item, `${atPath}.${key}`);
        if (sanitized !== undefined) out[key] = sanitized;
      }
      return out;
    }
    default:
      throw new Error(`Cannot serialize ${typeof value} at ${atPath}`);
  }
}

/**
 * Sanitizes one NodeSpec/MarkSpec. In ProseMirror, an attribute is optional
 * iff its spec has a `default` property, so a `default` that can't be
 * serialized (function/undefined) would silently become "required" — fail
 * loudly instead so the extension gets fixed or special-cased consciously.
 */
function sanitizeSpec(typeName: string, spec: Record<string, unknown>): JsonValue {
  const clean = Object.fromEntries(Object.entries(spec).filter(([key]) => !DOM_ONLY_KEYS.has(key)));

  const attrs = clean.attrs as Record<string, Record<string, unknown>> | undefined;
  if (attrs) {
    clean.attrs = Object.fromEntries(
      Object.entries(attrs).map(([attrName, attrSpec]) => {
        if (!Object.prototype.hasOwnProperty.call(attrSpec, 'default')) {
          return [attrName, attrSpec];
        }
        if (attrSpec.default === undefined) {
          // JSON can't distinguish `default: undefined` (optional; the attr is
          // simply omitted from serialized nodes, e.g. imageBlock.alt) from no
          // `default` at all (required). Map to null to keep the attr optional.
          return [attrName, { ...attrSpec, default: null }];
        }
        if (sanitizeValue(attrSpec.default, '') === undefined) {
          throw new Error(
            `Attribute default for "${typeName}.${attrName}" is not JSON-serializable ` +
              `(${typeof attrSpec.default}); dropping it would make the attribute required.`
          );
        }
        return [attrName, attrSpec];
      })
    );
  }

  return sanitizeValue(clean, typeName) ?? {};
}

/** Serializes a schema to a plain-JSON spec, preserving schema order. */
function schemaToJsonSpec(schema: Schema): JsonValue {
  const nodes: { [name: string]: JsonValue } = {};
  schema.spec.nodes.forEach((name: string, spec: Record<string, unknown>) => {
    nodes[name] = sanitizeSpec(`nodes.${name}`, spec);
  });
  const marks: { [name: string]: JsonValue } = {};
  schema.spec.marks.forEach((name: string, spec: Record<string, unknown>) => {
    marks[name] = sanitizeSpec(`marks.${name}`, spec);
  });
  return { topNode: schema.topNodeType.name, nodes, marks };
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
  fs.writeFileSync(outPath, `${JSON.stringify(schemaToJsonSpec(schema), null, 2)}\n`);
  const nodeCount = Object.keys(schema.nodes).length;
  const markCount = Object.keys(schema.marks).length;
  console.log(
    `Wrote ${path.relative(process.cwd(), outPath)} (${nodeCount} nodes, ${markCount} marks)`
  );
}
