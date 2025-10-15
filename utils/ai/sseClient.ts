import { ApiClient } from '@/services/client';

export interface SSECallbacks {
  onChunk?: (chunk: any) => void;
  onDone?: (data: any) => void;
  onError?: (error: Error) => void;
}

export class SSEClient {
  private controller: AbortController | null = null;

  async stream(url: string, body: Record<string, any>, callbacks: SSECallbacks): Promise<void> {
    this.controller = new AbortController();

    const authToken = ApiClient.getGlobalAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };

    if (authToken) {
      headers['Authorization'] = `Token ${authToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Stream request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            // Parse SSE event
            const eventType = line.substring(6).trim();
            continue;
          }
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                // Text chunk with delta
                callbacks.onChunk?.(parsed);
              } else if (parsed.error) {
                // Error event
                callbacks.onError?.(new Error(parsed.error));
              } else {
                // Done event (has conversation_id, message_id, etc.)
                callbacks.onDone?.(parsed);
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        callbacks.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }

  abort() {
    this.controller?.abort();
  }
}
