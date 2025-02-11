import { EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect, useRef } from 'react';
import { StarterKit } from '@tiptap/starter-kit';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useNoteContent } from '@/hooks/useNote';
import '@/components/Editor/styles/index.css';
import { ID } from '@/types/root';
import { debounce } from 'lodash';

// Create a simplified Document extension that only accepts blocks
const CustomDocument = Document.extend({
  content: 'block+',
});

interface BlockEditorProps {
  content: string;
  contentJson?: string;
  isLoading?: boolean;
  noteId: ID;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  contentJson,
  isLoading = false,
  noteId,
}) => {
  const [{ isLoading: isUpdating }, updateNoteContent] = useNoteContent();

  // Create a ref for the debounced function
  const debouncedRef = useRef(
    debounce((editor) => {
      console.log('onUpdate debounced');
      const json = editor.getJSON();
      const html = editor.getHTML();

      updateNoteContent({
        note: noteId,
        fullSrc: html,
        plainText: editor.getText(),
        fullJson: JSON.stringify(json),
      }).catch(console.error);
    }, 2000)
  );

  const editor = useEditor({
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
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'min-h-full prose prose-sm max-w-none prose-neutral dark:prose-invert prose-headings:font-display',
      },
    },
    onUpdate: ({ editor }) => {
      console.log('editor update');
      debouncedRef.current(editor);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (editor && (content || contentJson)) {
      if (contentJson) {
        editor.commands.setContent(JSON.parse(contentJson));
      } else {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content, contentJson]);

  if (isLoading) {
    return <NotebookSkeleton />;
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 pr-1">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};
