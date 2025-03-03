import { Editor, EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect, useRef } from 'react';
import { StarterKit } from '@tiptap/starter-kit';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import '@/components/Editor/styles/index.css';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { ContentItemMenu } from '../menus/ContentItemMenu';
import { LinkMenu } from '../menus/LinkMenu';
import { TextMenu } from '../menus/TextMenu';
import ColumnsMenu from '../../extensions/MultiColumn/menus/ColumnsMenu';
import TableRowMenu from '../../extensions/Table/menus/TableRow';
import ImageBlockMenu from '../../extensions/ImageBlock/components/ImageBlockMenu';
import TableColumnMenu from '../../extensions/Table/menus/TableColumn';
// Create a simplified Document extension that only accepts blocks
const CustomDocument = Document.extend({
  content: 'heading block+',
});

export interface BlockEditorProps {
  content?: string;
  contentJson?: string;
  isLoading?: boolean;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
  aiToken?: string;
  ydoc: Y.Doc | null;
  provider?: TiptapCollabProvider | null | undefined;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  contentJson,
  onUpdate,
  aiToken,
  ydoc,
  provider,
  isLoading = false,
  editable = true,
}) => {
  const menuContainerRef = useRef(null);
  const { setEditor } = useNotebookPublish();

  const { editor, users, collabState } = useBlockEditor({
    aiToken,
    ydoc,
    provider,
    content,
    contentJson,
    onUpdate,
    editable,
  });

  const editorOld = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false,
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.attrs.level === 1) {
            return 'Enter a title...';
          }
          return '';
        },
      }),
    ],
    content: contentJson
      ? JSON.parse(contentJson)
      : {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '' }],
            },
          ],
        },
    editorProps: {
      attributes: {
        class:
          'min-h-full prose prose-sm max-w-none prose-neutral dark:prose-invert prose-headings:font-display',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor);
    },
  });

  useEffect(() => {
    if (editor && (content || contentJson)) {
      if (contentJson) {
        editor.commands.setContent(JSON.parse(contentJson));
      } else {
        editor.commands.setContent(content || '');
      }
    }
  }, [editor, content, contentJson]);

  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  if (isLoading) {
    return <NotebookSkeleton />;
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full" ref={menuContainerRef}>
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 pr-1">
        <EditorContent editor={editor} className="h-full" />
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
  );
};
