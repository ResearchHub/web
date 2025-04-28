import { Editor, EditorContent } from '@tiptap/react';
import React, { useEffect, useRef } from 'react';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import '@/components/Editor/styles/index.css';
import { useBlockEditor } from '../../hooks/useBlockEditor';
import { ContentItemMenu } from '../menus/ContentItemMenu';
import { LinkMenu } from '../menus/LinkMenu';
import { TextMenu } from '../menus/TextMenu';
import ColumnsMenu from '../../extensions/MultiColumn/menus/ColumnsMenu';
import TableRowMenu from '../../extensions/Table/menus/TableRow';
import ImageBlockMenu from '../../extensions/ImageBlock/components/ImageBlockMenu';
import TableColumnMenu from '../../extensions/Table/menus/TableColumn';
import { useNotebookContext } from '@/contexts/NotebookContext';

export interface BlockEditorProps {
  content?: string;
  contentJson?: string;
  isLoading?: boolean;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
  setEditor?: (editor: Editor | null) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  contentJson,
  onUpdate,
  setEditor,
  isLoading = false,
  editable = true,
}) => {
  const menuContainerRef = useRef(null);

  const { editor } = useBlockEditor({
    content,
    contentJson,
    onUpdate,
    editable,
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
    if (setEditor) {
      setEditor(editor);
    }
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
        {editable && (
          <>
            <ContentItemMenu editor={editor} />
            <LinkMenu editor={editor} appendTo={menuContainerRef} />
            <TextMenu editor={editor} />
            <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
            <TableRowMenu editor={editor} appendTo={menuContainerRef} />
            <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
            <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
          </>
        )}
      </div>
    </div>
  );
};
