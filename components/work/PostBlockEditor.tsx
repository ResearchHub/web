'use client';

import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { useEffect } from 'react';
import { removeTitleFromHTML } from '../Editor/lib/utils/documentTitle';
import { Editor } from '@tiptap/react';
import { cn } from '@/utils/styles';

interface PostBlockEditorProps {
  content: string;
  editable?: boolean;
  onEditorReady?: (editor: Editor | null) => void;
  className?: string;
}

/**
 * A wrapper for BlockEditorClientWrapper that applies custom styles for post content
 * to reduce excessive padding
 */
export const PostBlockEditor = ({
  content,
  editable = false,
  onEditorReady,
  className,
}: PostBlockEditorProps) => {
  // Add custom styles to override the default ProseMirror padding
  useEffect(() => {
    // Add a custom style tag to override ProseMirror styles when used in posts
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .post-content .ProseMirror {
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      // Clean up the style tag when component unmounts
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className={cn('post-content bg-white rounded-lg shadow-sm border p-6 mb-6', className)}>
      <BlockEditorClientWrapper content={content} editable={editable} setEditor={onEditorReady} />
    </div>
  );
};
