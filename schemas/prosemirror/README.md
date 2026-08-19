# ProseMirror schemas

JSON schema specs for the TipTap editors in this app, generated from the same
extension sets the frontend runs. They let backend code parse, validate, and
write editor documents against the exact schema the editors enforce — e.g. with
[prosemirror-py](https://github.com/fellowapp/prosemirror-py):

```python
import json
from prosemirror.model import Node, Schema

with open("comment-editor.json") as f:
    schema = Schema(json.load(f))

doc = Node.from_json(schema, comment_json)  # raises on unknown nodes/marks/attrs
doc.check()                                 # raises on invalid nesting/content
```

| File                  | Source extension set                                                     | Covers                      |
| --------------------- | ------------------------------------------------------------------------ | --------------------------- |
| `block-editor.json`   | `components/Editor/extensions/extension-kit.ts` (+ `AiWriter`/`AiImage`) | Notebook notes, posts       |
| `comment-editor.json` | `components/Comment/lib/commentEditorExtensions.ts`                      | Comments, incl. review mode |

## Regenerating

```bash
npm run schema:export
```

Output is deterministic — rerunning without extension changes produces
byte-identical files. **Any change to an editor's extensions (adding,
removing, or reconfiguring — configuration can alter attribute defaults) must
be accompanied by a regenerated schema**, and the backend copy updated.

Two layers enforce this:

- **Pre-commit**: committing a change under `components/Editor/extensions/`,
  `components/Comment/lib/`, or to the export script regenerates the schemas
  and stages them automatically (see `lint-staged` in `package.json`).
- **CI**: `.github/workflows/schema-check.yml` reruns the export on every PR
  and fails on any diff in this directory. It also catches drift the
  pre-commit globs can't see — e.g. a TipTap version bump changing a spec.

## What the export contains

Everything schema-relevant from each ProseMirror `NodeSpec`/`MarkSpec`:
content expressions, groups, attributes with defaults (including TipTap
global attributes like `textAlign` and UniqueID's `id`), `inline`/`atom`,
mark `excludes`, etc., in schema order (order affects content-fill defaults
and mark precedence).

Intentional deviations:

- **DOM-only fields are stripped** (`toDOM`, `parseDOM`, `leafText`,
  `toDebugString`) — they're functions and only matter in the browser. HTML
  conversion is therefore _not_ possible from these files; they are for
  working with documents in JSON form.
- **`default: undefined` becomes `default: null`** (e.g. `imageBlock.alt`).
  JSON can't distinguish "optional, serialized nodes omit the attr" from "no
  default = required", and keeping the attribute optional is the semantics
  that matter.
- **`comment-editor.json` is the review-mode superset** — it includes
  `sectionHeader`, which only review comments may contain. A generic comment
  containing one passes schema validation; rejecting that is app-level
  validation, not schema.
- **`block-editor.json` includes `aiWriter`/`aiImage`** — registered only
  when AI is enabled, but autosave can persist them mid-generation, so the
  schema accepts them.
- **`doc` is the permissive `block+` variant.** The _editable_ notebook
  editor swaps in a stricter document node (`content: "heading block+"`, see
  `useBlockEditor.ts`); the export keeps the permissive form so every
  persisted document validates. Backends writing notebook content should
  still emit a leading heading.
