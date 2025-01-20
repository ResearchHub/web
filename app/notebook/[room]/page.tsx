// @ts-nocheck
'use client';

import { TiptapCollabProvider } from '@hocuspocus/provider';
import 'iframe-resizer/js/iframeResizer.contentWindow';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Doc as YDoc } from 'yjs';

import { BlockEditor } from '@/components/Editor/components/BlockEditor';
import { useCollaboration } from '@/components/Editor/hooks/useCollaboration';
import NotebookLayout from '../layout/NotebookLayout';

type PageParams = Promise<{
  room: string;
}>;

type Props = {
  params: PageParams;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getPageParams(): Promise<PageParams> {
  return { room: '' }; // This will be populated by Next.js routing
}

export default async function Document({ params, searchParams }: Props) {
  const { room } = await params;
  const searchParamsData = await searchParams;
  const [aiToken, setAiToken] = useState<string | null | undefined>();
  const urlSearchParams = useSearchParams();
  const providerState = useCollaboration({
    docId: room,
    enabled: parseInt(urlSearchParams?.get('noCollab') as string) !== 1,
  });

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await fetch('/notebook/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('No AI token provided, please set TIPTAP_AI_SECRET in your environment');
        }
        const data = await response.json();
        const { token } = data;
        setAiToken(token);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        setAiToken(null);
        return;
      }
    };

    dataFetch();
  }, []);

  if (providerState.state === 'loading' || aiToken === undefined) return null;

  return (
    <NotebookLayout>
      <BlockEditor
        aiToken={aiToken ?? undefined}
        ydoc={providerState.yDoc}
        provider={providerState.provider}
      />
    </NotebookLayout>
  );
}
