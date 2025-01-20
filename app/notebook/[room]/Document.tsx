// app/notebook/[room]/Document.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor';
import { useCollaboration } from '@/components/Editor/hooks/useCollaboration';
import NotebookLayout from '../layout/NotebookLayout';

interface DocumentProps {
  room: string;
}

export default function Document({ room }: DocumentProps) {
  const [aiToken, setAiToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const noCollab = searchParams ? parseInt(searchParams.get('noCollab') || '0', 10) !== 1 : false;

  const providerState = useCollaboration({
    docId: room,
    enabled: !noCollab,
  });

  useEffect(() => {
    const fetchAiToken = async () => {
      try {
        const response = await fetch('/notebook/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            'Failed to fetch AI token. Please set TIPTAP_AI_SECRET in your environment.'
          );
        }

        const data = await response.json();
        setAiToken(data.token);
      } catch (error) {
        console.error((error as Error).message);
        setAiToken(null);
      }
    };

    fetchAiToken();
  }, []);

  if (providerState.state === 'loading' || aiToken === undefined) {
    return <div>Loading...</div>;
  }

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
