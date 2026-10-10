import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/**
 * A workspace document's title is its first block, when that is a top-level
 * heading: there is no separate title field to edit. Everything that needs
 * the title (the top bar, the publish dialog, the note's saved title) reads
 * it through the helpers here, so they agree on what counts.
 */

/** The note API's limit. */
export const MAX_TITLE_LENGTH = 255;

/** A title as it is saved: one line, single spaces, nothing at the ends. */
export const normalizeTitle = (draft: string): string => draft.replaceAll(/\s+/g, ' ').trim();

/** The heading that holds the title, or null when the document does not open with one. */
export const leadingTitleNode = (doc: ProseMirrorNode): ProseMirrorNode | null => {
  const first = doc.firstChild;
  return first?.type.name === 'heading' && first.attrs.level === 1 ? first : null;
};

/** The title in an editor's document; null when it has no title heading or an empty one. */
export const titleOf = (doc: ProseMirrorNode): string | null => {
  const heading = leadingTitleNode(doc);
  return heading ? normalizeTitle(heading.textContent) || null : null;
};

/**
 * The title in a saved version's JSON, by the same rule, so it is known as
 * soon as the note loads, before the editor is up.
 */
export function titleFromContentJson(json: string | undefined): string | null {
  if (!json) return null;
  try {
    const first = (JSON.parse(json) as { content?: unknown[] })?.content?.[0] as
      | { type?: string; attrs?: { level?: number }; content?: { text?: string }[] }
      | undefined;
    if (first?.type !== 'heading' || first.attrs?.level !== 1) return null;
    return normalizeTitle((first.content ?? []).map((part) => part.text ?? '').join('')) || null;
  } catch {
    return null;
  }
}
