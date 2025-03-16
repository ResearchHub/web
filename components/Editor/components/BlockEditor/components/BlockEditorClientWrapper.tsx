'use client';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { useEffect, useState } from 'react';
import { BlockEditorProps } from '../BlockEditor';
import { NotebookProvider } from '@/contexts/NotebookContext';

export function BlockEditorClientWrapper(props: BlockEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <NotebookProvider>
      <BlockEditor {...props} isLoading={!isMounted} />
    </NotebookProvider>
  );
}
