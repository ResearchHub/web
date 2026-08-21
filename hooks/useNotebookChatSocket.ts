'use client';

import { useMemo } from 'react';
import { WS_ROUTES } from '@/services/websocket';
import type { ChatSocketEvent } from '@/types/notebookChat';
import { useReconnectingSocket, type SocketStatus } from './useReconnectingSocket';

/**
 * Server-defined close codes that mean reconnecting is pointless for this
 * chat: unauthenticated (4401), not editor/moderator (4403), chat/note not
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
   * An event arrived. Events carry identifiers, never state — the only correct
   * reaction to any kind is a (debounced) refetch, which the caller owns.
   */
  onEvent: (event: ChatSocketEvent) => void;
  /** Socket re-opened after a drop — refetch immediately, events were missed. */
  onReconnect: () => void;
}

/** One WebSocket per open chat, used purely as a refetch nudge. */
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
    // Frames on this channel are chat events by contract; unknown `type`
    // values pass through and the consumer treats any event as a nudge.
    onMessage: (data) => onEvent(data as ChatSocketEvent),
    onReconnect,
  });
}
