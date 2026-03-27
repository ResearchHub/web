import { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import type { AnyExtension, Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { TextAlign } from '@tiptap/extension-text-align';
import { History } from '@tiptap/extension-history';

import { ExtensionKit } from '@/components/Editor/extensions/extension-kit';
import { Ai } from '@/components/Editor/extensions/Ai';
import { AiImage, AiWriter } from '@/components/Editor/extensions';

const CustomDocument = Document.extend({
  content: 'heading block+',
});

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useBlockEditor = ({
  aiToken,
  userId,
  userName = 'Maxi',
  editable = true,
  content,
  contentJson,
  onUpdate,
  customClass,
  includeTitle = false,
}: {
  aiToken?: string;
  userId?: string;
  userName?: string;
  editable?: boolean;
  content?: string;
  contentJson?: string;
  onUpdate?: (editor: Editor) => void;
  customClass?: string;
  includeTitle?: boolean;
}) => {
  const editor = useEditor(
    {
      editable,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      autofocus: editable,
      extensions: [
        ...ExtensionKit({
          customDocument: editable ? CustomDocument : undefined,
          placeholderConfig: {
            includeChildren: true,
            showOnlyCurrent: false,
            showOnlyWhenEditable: true,
            placeholder: ({ node }) => {
              if (node.type.name === 'heading') {
                return 'Enter a title...';
              }
              return '';
            },
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        History.configure({
          depth: 100,
        }),
        aiToken
          ? AiWriter.configure({
              authorId: userId,
              authorName: userName,
            })
          : undefined,
        aiToken
          ? AiImage.configure({
              authorId: userId,
              authorName: userName,
            })
          : undefined,
        aiToken ? Ai.configure({ token: aiToken }) : undefined,
      ].filter((e): e is AnyExtension => e !== undefined),
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          class:
            customClass ||
            'min-h-full prose prose-sm max-w-none prose-neutral dark:prose-invert prose-headings:font-display',
        },
      },
      content: contentJson
        ? JSON.parse(contentJson)
        : content || {
            type: 'doc',
            content: [],
          },
      onUpdate: ({ editor }) => {
        onUpdate?.(editor);
      },
    },
    [content, contentJson, editable, customClass, includeTitle]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && editor) {
      window.editor = editor;
    }
  }, [editor]);

  return { editor };
};
