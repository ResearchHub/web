import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { debounce } from 'lodash';
import { countWords } from '@/utils/stringUtils';

interface UseWordCountOptions {
  editor: Editor | null;
  limit?: number;
}

/** Tracks word count from a TipTap editor with optional limit */
export const useWordCount = ({ editor, limit }: UseWordCountOptions) => {
  const [wordCount, setWordCount] = useState(0);
  const debouncedSetCount = useRef(debounce((text: string) => setWordCount(countWords(text)), 300));

  useEffect(() => {
    if (!editor || !limit) return;

    setWordCount(countWords(editor.getText()));

    const handleUpdate = () => debouncedSetCount.current(editor.getText());
    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      debouncedSetCount.current.cancel();
    };
  }, [editor, limit]);

  return { wordCount, isOverLimit: !!limit && wordCount > limit };
};
