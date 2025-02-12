'use client';

import { NotebookPublishProvider } from '@/contexts/NotebookPublishContext';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { useEffect, useState } from 'react';
import { BlockEditorProps } from './BlockEditor';
export function BlockEditorClientWrapper(props: BlockEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <NotebookPublishProvider>
      <BlockEditor {...props} isLoading={!isMounted} />
    </NotebookPublishProvider>
  );
}
