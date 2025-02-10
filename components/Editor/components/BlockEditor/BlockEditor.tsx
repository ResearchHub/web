import { EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect } from 'react';
import { StarterKit } from '@tiptap/starter-kit';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import '@/components/Editor/styles/index.css';

interface BlockEditorProps {
  content: string;
  isLoading?: boolean;
}

// Create a simplified Document extension that only accepts blocks
const CustomDocument = Document.extend({
  content: 'block+',
});

export const BlockEditor: React.FC<BlockEditorProps> = ({ content, isLoading = false }) => {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false, // Using custom Document extension
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
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'min-h-full prose prose-sm max-w-none prose-neutral dark:prose-invert prose-headings:font-display',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (isLoading) {
    return <NotebookSkeleton />;
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full">
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      </div>
    </div>
  );
};
