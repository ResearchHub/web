'use client';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { useEffect, useState } from 'react';
import { BlockEditorProps } from '../BlockEditor';
import { OrganizationDataProvider } from '@/contexts/OrganizationDataContext';

export function BlockEditorClientWrapper(props: BlockEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <OrganizationDataProvider>
      <BlockEditor {...props} isLoading={!isMounted} />
    </OrganizationDataProvider>
  );
}
