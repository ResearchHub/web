'use client';

import { useEffect, useRef, useState } from 'react';
import { getSession } from 'next-auth/react';
import { ApiClient } from '@/services/client';
import { WS_ROUTES } from '@/services/websocket';
import type { ChatSocketEvent } from '@/types/notebookChat';

/**
 * Server-defined close codes that mean reconnecting is pointless for this
 * chat: unauthenticated (4401), not editor/moderator (4403), chat/note not
 * found or not yours (4404). REST polling remains the fallback, and the REST
 * layer surfaces the matching access error to the UI.
 */
const FATAL_CLOSE_CODES = new Set([4401, 4403, 4404]);

const MAX_RECONNECT_DELAY_MS = 30_000;

export type ChatSocketStatus = 'idle' | 'connecting' | 'open' | 'closed';

interface UseNotebookChatSocketOptions {
  noteId: string | number | null;
  chatId: string | number | null;
  /** Connect only while the chat exists and is open on screen. */
  enabled: boolean;
  /**
   * An event arrived. Events carry identifiers, never state — the only correct
   * reaction to any kind is a (debounced) refetch, which the caller owns.
   */
  onEvent: (event: ChatSocketEvent) => void;
  /** Socket re-opened after a drop — refetch immediately, events were missed. */
  onReconnect: () => void;
}

async function getAuthToken(): Promise<string | null> {
  const cached = ApiClient.getGlobalAuthToken();
  if (cached) return cached;
  try {
    const session = await getSession();
    return session?.authToken ?? null;
  } catch {
    return null;
  }
}

/**
 * One WebSocket per open chat, used purely as a refetch nudge. Auth uses the
 * same subprotocol pattern as the existing note socket: the token rides in the
 * subprotocols array and the server accepts by echoing `Token`.
 *
 * Reconnects with exponential backoff on any non-fatal close; never reconnects
 * on the 44xx access codes. The socket is a latency optimization — every
 * failure mode here degrades to polling, never to wrong data.
 */
export function useNotebookChatSocket({
  noteId,
  chatId,
  enabled,
  onEvent,
  onReconnect,
}: UseNotebookChatSocketOptions): ChatSocketStatus {
  const [status, setStatus] = useState<ChatSocketStatus>('idle');

  // Keep callbacks in refs so handler identity never forces a resubscribe.
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);
  onEventRef.current = onEvent;
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    if (!enabled || noteId == null || chatId == null) {
      setStatus('idle');
      return;
    }

    let disposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let hasOpenedBefore = false;

    const url = WS_ROUTES.NOTEBOOK_CHAT(noteId, chatId);

    const scheduleReconnect = () => {
      if (disposed) return;
      attempts += 1;
      const delay = Math.min(1000 * 2 ** (attempts - 1), MAX_RECONNECT_DELAY_MS);
      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = async () => {
      if (disposed) return;
      setStatus('connecting');

      const token = await getAuthToken();
      if (disposed) return;
      if (!token) {
        // No session to authenticate with; a later remount (login) retries.
        setStatus('closed');
        return;
      }

      try {
        ws = new WebSocket(url, ['Token', token]);
      } catch {
        setStatus('closed');
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (disposed) return;
        attempts = 0;
        setStatus('open');
        if (hasOpenedBefore) {
          onReconnectRef.current();
        }
        hasOpenedBefore = true;
      };

      ws.onmessage = (event) => {
        if (disposed) return;
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data === 'object') {
            onEventRef.current(data as ChatSocketEvent);
          }
        } catch {
          // Malformed frame — ignore; the poll fallback keeps state correct.
        }
      };

      ws.onclose = (event) => {
        ws = null;
        if (disposed) return;
        setStatus('closed');
        if (FATAL_CLOSE_CODES.has(event.code)) {
          return;
        }
        scheduleReconnect();
      };

      // Errors are always followed by close; reconnect is handled there.
      ws.onerror = () => {};
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        // Detach handlers before closing so the unmount close doesn't schedule work.
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        try {
          ws.close(1000, 'chat closed');
        } catch {
          // Already closing.
        }
      }
      setStatus('idle');
    };
  }, [noteId, chatId, enabled]);

  return status;
}
