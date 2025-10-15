import { useState, useCallback, useRef } from 'react';
import { SSEClient } from '@/utils/ai/sseClient';
import { AIService } from '@/services/ai.service';
import type { AICompletionRequest, SSEChunk } from '@/types/ai';

export function useAICompletion(noteId: number) {
  const [completion, setCompletion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [completionLogId, setCompletionLogId] = useState<number | null>(null);
  const sseClientRef = useRef<SSEClient | null>(null);

  const getCompletion = useCallback(
    async (context: string, cursorPosition: number) => {
      setIsLoading(true);
      setError(null);
      setCompletion('');

      const client = new SSEClient();
      sseClientRef.current = client;

      const url = AIService.getCompletionStreamUrl(noteId);
      const body: AICompletionRequest = { context, cursor_position: cursorPosition };

      await client.stream(url, body, {
        onChunk: (chunk: any) => {
          if (chunk.delta) {
            setCompletion((prev) => prev + chunk.delta);
          }
        },
        onDone: (data) => {
          setCompletionLogId(data.completion_log_id);
          setIsLoading(false);
        },
        onError: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });
    },
    [noteId]
  );

  const accept = useCallback(async () => {
    if (completionLogId) {
      await AIService.acceptCompletion(completionLogId);
    }
    setCompletion('');
    setCompletionLogId(null);
  }, [completionLogId]);

  const reject = useCallback(() => {
    sseClientRef.current?.abort();
    setCompletion('');
    setCompletionLogId(null);
    setIsLoading(false);
  }, []);

  return { getCompletion, completion, isLoading, error, accept, reject };
}
