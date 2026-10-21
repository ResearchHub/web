'use client';

import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { Editor } from '@tiptap/react';
import { cn } from '@/utils/styles';

interface PostBlockEditorProps {
  content?: string;
  contentJson?: string;
  editable?: boolean;
  onEditorReady?: (editor: Editor | null) => void;
  className?: string;
}

/**
 * A wrapper for BlockEditorClientWrapper in a post's card. The editor's own
 * padding comes off through `.post-content` in globals.css.
 */
export const PostBlockEditor = ({
  content,
  contentJson,
  editable = false,
  onEditorReady,
  className,
}: PostBlockEditorProps) => {
  return (
    <div className={cn('post-content bg-white rounded-lg shadow-sm border p-6 mb-6', className)}>
      <BlockEditorClientWrapper
        content={content}
        contentJson={contentJson}
        editable={editable}
        setEditor={onEditorReady}
      />
    </div>
  );
};
