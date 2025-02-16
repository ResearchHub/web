import { Editor, JSONContent } from '@tiptap/core';

export const getDocumentTitle = (content: JSONContent | undefined): string => {
  const firstHeading = content?.content?.find(
    (node) => node.type === 'heading' && node.attrs?.level === 1
  );

  return firstHeading?.content?.[0]?.text || '';
};

export const getDocumentTitleFromEditor = (editor: Editor | null): string => {
  if (!editor) return '';
  return getDocumentTitle(editor.getJSON());
};
