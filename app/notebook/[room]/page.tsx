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

type Props = {
  params: {
    room: string;
  };
};

export default function Document(props: Props) {
  const { params } = props;
  const [aiToken, setAiToken] = useState<string | null | undefined>();
  const searchParams = useSearchParams();
  const providerState = useCollaboration({
    docId: params.room,
    enabled: parseInt(searchParams?.get('noCollab') as string) !== 1,
  });

  useEffect(() => {
    // fetch data
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

        // set state when the data received
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

  if (providerState.state === 'loading' || aiToken === undefined) return;

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
