'use client';

import { useMemo } from 'react';
import { WS_ROUTES } from '@/services/websocket';
import { isChatSocketEvent, type ChatSocketEvent } from '@/types/notebookChat';
import { useReconnectingSocket, type SocketStatus } from './useReconnectingSocket';

/**
 * Server-defined close codes that mean reconnecting is pointless for this
 * chat: unauthenticated (4401), access denied (4403), chat/note not
 * found or not yours (4404). REST polling remains the fallback, and the REST
 * layer surfaces the matching access error to the UI.
 */
const FATAL_CLOSE_CODES: ReadonlySet<number> = new Set([4401, 4403, 4404]);

export type ChatSocketStatus = SocketStatus;

interface UseNotebookChatSocketOptions {
  noteId: string | number | null;
  chatId: string | number | null;
  /** Connect only while the chat exists and is open on screen. */
  enabled: boolean;
  /**
   * An event arrived. Lifecycle events are refetch nudges; stream events carry
   * sequenced append deltas. The caller owns both paths.
   */
  onEvent: (event: ChatSocketEvent) => void;
  /** Socket re-opened after a drop — refetch immediately, events were missed. */
  onReconnect: () => void;
}

/** One WebSocket per open chat for lifecycle nudges and transient output. */
export function useNotebookChatSocket({
  noteId,
  chatId,
  enabled,
  onEvent,
  onReconnect,
}: UseNotebookChatSocketOptions): ChatSocketStatus {
  const url = useMemo(
    () => (noteId != null && chatId != null ? WS_ROUTES.NOTEBOOK_CHAT(noteId, chatId) : null),
    [noteId, chatId]
  );

  return useReconnectingSocket({
    url,
    enabled: enabled && url != null,
    fatalCloseCodes: FATAL_CLOSE_CODES,
    // Frames on this channel are chat events by contract. Runtime validation
    // of stream fields happens in the caller; unknown kinds remain nudges.
    onMessage: (data) => {
      if (isChatSocketEvent(data)) onEvent(data);
    },
    onReconnect,
  });
}
