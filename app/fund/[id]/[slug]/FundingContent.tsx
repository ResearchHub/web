'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface FundingContentProps {
  content: string;
}

export function FundingContent({ content }: FundingContentProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(content),
    editable: false,
  });

  return <EditorContent editor={editor} className="prose max-w-none" />;
}
