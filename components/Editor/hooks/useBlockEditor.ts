import { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import type { AnyExtension, Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { UndoRedo } from '@tiptap/extensions';
import { migrateMathStrings } from '@tiptap/extension-mathematics';

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
        UndoRedo.configure({
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
      onCreate: ({ editor }) => {
        // Tiptap v3 represents math as inlineMath/blockMath nodes instead of
        // the `$...$` text strings v2 decorated, so documents saved by v2 need
        // converting on open or they render as literal `$...$`. Read-only
        // mounts convert too (for display); they never pass an onUpdate, so
        // nothing is written back until someone opens the note editably.
        migrateMathStrings(editor);
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
