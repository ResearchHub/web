import { useEffect, useState } from 'react';
import { useEditor, useEditorState } from '@tiptap/react';
import type { AnyExtension, Editor } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { TiptapCollabProvider, WebSocketStatus } from '@hocuspocus/provider';
import type { Doc as YDoc } from 'yjs';
import { Document } from '@tiptap/extension-document';
import { TextAlign } from '@tiptap/extension-text-align';
import { History } from '@tiptap/extension-history';

import { ExtensionKit } from '@/components/Editor/extensions/extension-kit';
import { userColors, userNames } from '../lib/constants';
import { randomElement } from '../lib/utils';
import type { EditorUser } from '../components/BlockEditor/types';
import { Ai } from '@/components/Editor/extensions/Ai';
import { AiImage, AiWriter } from '@/components/Editor/extensions';

// Create a simplified Document extension that accepts heading and block content
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
  ydoc,
  provider,
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
  ydoc?: YDoc | null;
  provider?: TiptapCollabProvider | null | undefined;
  userId?: string;
  userName?: string;
  editable?: boolean;
  content?: string;
  contentJson?: string;
  onUpdate?: (editor: Editor) => void;
  customClass?: string;
  includeTitle?: boolean;
}) => {
  const [collabState, setCollabState] = useState<WebSocketStatus>(
    provider ? WebSocketStatus.Connecting : WebSocketStatus.Disconnected
  );

  const editor = useEditor(
    {
      editable,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      autofocus: editable,
      extensions: [
        ...ExtensionKit({
          provider,
          customDocument: editable && includeTitle ? CustomDocument : undefined,
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
        provider && ydoc
          ? Collaboration.configure({
              document: ydoc,
            })
          : undefined,
        provider
          ? CollaborationCursor.configure({
              provider,
              user: {
                name: randomElement(userNames),
                color: randomElement(userColors),
              },
            })
          : undefined,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        provider && ydoc
          ? undefined
          : History.configure({
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
            content: false
              ? [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: '' }],
                  },
                ]
              : [],
          },
      onUpdate: ({ editor }) => {
        onUpdate?.(editor);
      },
    },
    [ydoc, provider, content, contentJson, editable, customClass, includeTitle]
  );

  const users = useEditorState({
    editor,
    selector: (ctx): (EditorUser & { initials: string })[] => {
      if (!ctx.editor?.storage.collaborationCursor?.users) {
        return [];
      }

      return ctx.editor.storage.collaborationCursor.users.map((user: EditorUser) => {
        const names = user.name?.split(' ');
        const firstName = names?.[0];
        const lastName = names?.[names.length - 1];
        const initials = `${firstName?.[0] || '?'}${lastName?.[0] || '?'}`;

        return { ...user, initials: initials.length ? initials : '?' };
      });
    },
  });

  useEffect(() => {
    provider?.on('status', (event: { status: WebSocketStatus }) => {
      setCollabState(event.status);
    });
  }, [provider]);

  useEffect(() => {
    if (typeof window !== 'undefined' && editor) {
      window.editor = editor;
    }
  }, [editor]);

  return { editor, users, collabState };
};
