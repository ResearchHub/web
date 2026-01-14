import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { countWords } from '@/utils/stringUtils';

interface UseWordCountOptions {
  editor: Editor | null;
  limit?: number;
}

/** Tracks word count from a TipTap editor with optional limit */
export const useWordCount = ({ editor, limit }: UseWordCountOptions) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (!editor || !limit) return;

    const updateCount = () => setWordCount(countWords(editor.getText()));
    updateCount();

    editor.on('update', updateCount);
    return () => {
      editor.off('update', updateCount);
    };
  }, [editor, limit]);

  return { wordCount, isOverLimit: !!limit && wordCount > limit };
};
