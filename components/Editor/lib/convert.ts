'use client';

import { Editor, JSONContent } from '@tiptap/core';
import type { AnyExtension } from '@tiptap/core';
import { TextAlign } from '@tiptap/extension-text-align';
import { History } from '@tiptap/extension-history';
import { Import } from '@tiptap-pro/extension-import';

import { ExtensionKit } from '@/components/Editor/extensions/extension-kit';
import { getDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';

/**
 * Supported source formats for the Tiptap Cloud Convert import flow.
 * Mirrors the legacy `@tiptap-pro/extension-import` `formatMap`:
 *   - docx: Microsoft Word (routes to the `/import-docx` endpoint via the
 *     `experimentalDocxImport` flag).
 *   - odt:  OpenDocument Text (LibreOffice, Google Docs export).
 *   - md:   CommonMark / GitHub Flavored Markdown. We pass `format: 'gfm'`
 *     for any `.md` file so tables, task lists, and strikethrough parse
 *     correctly — the GFM superset is backward-compatible with CommonMark
 *     for everything else, so there's no downside.
 */
export type SupportedImportFormat = 'docx' | 'odt' | 'md';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ODT_MIME = 'application/vnd.oasis.opendocument.text';
const MD_MIMES = new Set(['text/markdown', 'text/x-markdown']);

/**
 * Server-enforced upload size cap (25 MB). The modal's file picker also
 * blocks uploads larger than this, but we re-check here so the limit holds
 * even if `importDocumentToTiptap` is called from another caller that
 * doesn't run the modal's validation.
 */
const MAX_IMPORT_SIZE = 25 * 1024 * 1024;

/**
 * Resolve a file to one of our supported import formats, preferring MIME
 * type when the OS provided one and falling back to the filename extension.
 * Returns null for unsupported inputs so callers can produce a clear error.
 */
export const detectImportFormat = (file: File): SupportedImportFormat | null => {
  const name = file.name.toLowerCase();

  if (file.type === DOCX_MIME || name.endsWith('.docx')) return 'docx';
  if (file.type === ODT_MIME || name.endsWith('.odt')) return 'odt';
  if (MD_MIMES.has(file.type) || name.endsWith('.md') || name.endsWith('.markdown')) return 'md';

  return null;
};

/**
 * Strip the source-format extension from a filename so it can be used as a
 * fallback note title. Only strips the extensions we actually accept so we
 * don't accidentally mangle filenames like `data.archive.docx`.
 */
const stripImportExtension = (filename: string): string =>
  filename.replace(/\.(docx|odt|md|markdown)$/i, '').trim();

/**
 * Fetch a fresh convert JWT for each import. Tokens expire after 15 minutes
 * (see `/notebook/api/convert`), so a single fetch per import is the
 * simplest correct behavior. Caching would force us to manage expiry
 * client-side; not worth it given each import already pays the round-trip.
 */
const fetchConvertToken = async (): Promise<string> => {
  const response = await fetch('/notebook/api/convert', { method: 'POST' });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch convert token (${response.status}). Is TIPTAP_CONVERT_SECRET set?`
    );
  }
  const body = (await response.json()) as { token?: string; error?: string };
  if (!body.token) {
    throw new Error(body.error || 'Convert token response did not include a token.');
  }
  return body.token;
};

export interface DocumentImportResult {
  /** TipTap JSON document the live editor can render directly. */
  json: JSONContent;
  /** Serialized HTML for the legacy `content` field on the note record. */
  html: string;
  /** Plain text for search indexing and excerpts. */
  plainText: string;
  /** Heuristic title pulled from the document (first heading, falls back to filename). */
  title: string;
  /** The format the source file was detected as. */
  format: SupportedImportFormat;
}

/**
 * Convert a supported document (.docx, .odt, .md) to TipTap content by
 * spinning up a headless editor that uses the same extension kit as the
 * live note editor. The throwaway editor is destroyed before the function
 * returns.
 *
 * Image handling: this v1 does not pass `imageUploadCallbackUrl` to the
 * Import extension, so embedded images are stripped on import. Wiring image
 * upload requires a public Next.js callback route plus either a server-side
 * AWS SDK or a shared-secret Django endpoint. Tracked as a follow-up.
 */
export const importDocumentToTiptap = async (
  file: File,
  options: { fallbackTitle?: string } = {}
): Promise<DocumentImportResult> => {
  // The Tiptap Cloud App ID is account-wide and shared across products
  // (Content AI, Convert, Collab). Each product has its own JWT secret on
  // the server, but the App ID is the same value used by `Ai.ts`.
  const appId = process.env.NEXT_PUBLIC_TIPTAP_APP_ID;
  if (!appId) {
    throw new Error(
      'NEXT_PUBLIC_TIPTAP_APP_ID is not set. Add it to your environment to enable document import.'
    );
  }

  const format = detectImportFormat(file);
  if (!format) {
    throw new Error('Unsupported file type. Please upload a .docx, .odt, or .md document.');
  }

  if (file.size > MAX_IMPORT_SIZE) {
    throw new Error(
      `Document is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). The maximum is ${MAX_IMPORT_SIZE / 1024 / 1024} MB.`
    );
  }

  const token = await fetchConvertToken();

  // The headless import editor uses the *default* Document node (which
  // accepts `block+`) rather than the live editor's `heading block+` custom
  // document. Two reasons:
  //   1) Many imported documents don't start with a heading (especially
  //      markdown). Forcing `heading block+` during import would cause
  //      ProseMirror to coerce or drop the leading content, silently
  //      corrupting the imported document.
  //   2) The live editor's schema is enforced at the editing layer; the
  //      stored JSON just needs to be coercible into it. We handle that
  //      coercion explicitly below by prepending a title heading if needed.
  const extensions: AnyExtension[] = [
    ...ExtensionKit({}),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    History.configure({ depth: 100 }),
    Import.configure({
      appId,
      token,
      // experimentalDocxImport is required on legacy 2.x to opt into the
      // DOCX-specific endpoint. It's a no-op for ODT/Markdown (the
      // extension only takes the docx branch when the file MIME matches),
      // so we can safely leave it on for all imports.
      experimentalDocxImport: true,
    }),
  ];

  // Initial content is a single paragraph rather than `{ content: [] }`.
  // The TrailingNode plugin's state.init reads doc.lastChild, which is null
  // for a truly empty doc and crashes the plugin. A single paragraph is the
  // simplest valid seed that satisfies every plugin's invariants.
  const editor = new Editor({
    extensions,
    editable: false,
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
  });

  try {
    const json = await new Promise<JSONContent>((resolve, reject) => {
      let settled = false;

      // Safety net: surface a timeout rather than hanging the UI if onImport
      // never fires (network outage, hung extension, etc).
      const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Document import timed out after 60 seconds.'));
      }, 60_000);

      editor
        .chain()
        .import({
          file,
          // `format: 'gfm'` only matters for markdown (it flips a query
          // flag on the Convert endpoint enabling GFM extensions). For
          // docx/odt the extension ignores it.
          ...(format === 'md' ? ({ format: 'gfm' } as const) : {}),
          onImport(context) {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            if (context.error) {
              reject(context.error);
              return;
            }
            // setEditorContent writes the normalized content into the
            // throwaway editor; reading getJSON afterwards captures it
            // shaped against our local schema (unknown nodes filtered).
            context.setEditorContent();
            resolve(editor.getJSON());
          },
        })
        .run();
    });

    // The live editor requires `heading block+`. If the imported doc doesn't
    // start with a heading, prepend one derived from the filename so the
    // result is loadable in the live editor without ProseMirror dropping or
    // mangling the leading content.
    const fallbackTitle = stripImportExtension(file.name) || options.fallbackTitle || 'Untitled';
    const normalizedJson = ensureLeadingHeading(json, fallbackTitle);

    const html = editor.getHTML();
    const plainText = editor.getText();
    const headingTitle = getDocumentTitle(normalizedJson);
    const title = (headingTitle && headingTitle.trim()) || fallbackTitle;

    return { json: normalizedJson, html, plainText, title, format };
  } finally {
    editor.destroy();
  }
};

/**
 * Ensure the imported document starts with a level-1 heading. If the first
 * block is already a heading we leave it alone. Otherwise we synthesize one
 * from `fallbackTitle` so the resulting JSON satisfies the live editor's
 * `heading block+` schema constraint.
 */
const ensureLeadingHeading = (doc: JSONContent, fallbackTitle: string): JSONContent => {
  const firstBlock = doc.content?.[0];
  if (firstBlock?.type === 'heading') {
    return doc;
  }
  return {
    ...doc,
    content: [
      {
        type: 'heading',
        attrs: { textAlign: 'left', level: 1 },
        content: [{ type: 'text', text: fallbackTitle }],
      },
      ...(doc.content ?? []),
    ],
  };
};
