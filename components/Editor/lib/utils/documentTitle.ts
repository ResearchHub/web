import { Editor, JSONContent } from '@tiptap/core';

export const getDocumentTitle = (content: JSONContent | undefined): string => {
  const firstHeading = content?.content?.find((node) => node.type === 'heading');

  return firstHeading?.content?.[0]?.text || '';
};

export const getDocumentTitleFromEditor = (editor: Editor | null): string => {
  if (!editor) return '';
  return getDocumentTitle(editor.getJSON());
};

export const setDocumentTitle = (editor: Editor | null, newTitle: string): void => {
  if (!editor) return;
  editor
    .chain()
    .command(({ tr }) => {
      const node = tr.doc.nodeAt(0);
      if (node?.type.name === 'heading') {
        tr.insertText(newTitle, 1, node.nodeSize - 1);
        return true;
      }
      return false;
    })
    .run();
};

const EMPTY_LEADING_BLOCK =
  /^\s*(?:<(?:p|div)(?:\s[^>]*)?>\s*(?:&nbsp;|\u00a0|<br\s*\/?>\s*)*<\/(?:p|div)>\s*)+/i;

/** Remove the document title (first h1) and any leading empty blocks left in its place. */
export function removeTitleFromHTML(html: string): string {
  let result = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');

  while (EMPTY_LEADING_BLOCK.test(result)) {
    result = result.replace(EMPTY_LEADING_BLOCK, '');
  }

  return result.trimStart();
}

/** Extract a plain-text string from a TipTap-style JSON template (top-level blocks only). */
export function getTemplatePlainText(content: JSONContent | undefined): string {
  return (
    content?.content
      ?.map((block) => block.content?.map((c) => c.text).join(' '))
      .filter(Boolean)
      .join('\n') || ''
  );
}
