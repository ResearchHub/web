import { Editor, JSONContent } from '@tiptap/core';

export const getDocumentTitle = (content: JSONContent | undefined): string => {
  const firstHeading = content?.content?.find((node) => node.type === 'heading');

  return firstHeading?.content?.[0]?.text || '';
};

export const getDocumentTitleFromEditor = (editor: Editor | null): string => {
  if (!editor) return '';
  return getDocumentTitle(editor.getJSON());
};

export function removeTitleFromHTML(html: string): string {
  return html.replace(/<h1[^>]*>.*?<\/h1>/i, '');
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
