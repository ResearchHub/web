'use client';

import { useEffect } from 'react';
import type { UseAgentChatListResult } from '@/hooks/useAgentChat';
import type { ChatTransport } from '@/services/chatTransport';
import type { AgentChatListItem } from '@/types/agentChat';
import { useAIMode } from './AIModeContext';
import { documentTarget, type WorkspaceTarget } from './workspaceUrl';

export interface ResolvedWorkspaceTarget {
  readonly target: WorkspaceTarget;
  /** The open chat; null on the start screen, on a new chat, and while `latest` is resolving. */
  readonly chatId: number | null;
  /** The document's chats are loading to say which is its most recent. */
  readonly resolving: boolean;
}

/** The chat with the newest activity. */
export function mostRecentChat(chats: readonly AgentChatListItem[]): AgentChatListItem | null {
  let latest: AgentChatListItem | null = null;
  for (const chat of chats) {
    if (latest == null || Date.parse(chat.updated_date) > Date.parse(latest.updated_date)) {
      latest = chat;
    }
  }
  return latest;
}

/**
 * What the workspace is open on, with a document's `latest` chat turned into
 * one: its most recent chat once its chats have loaded, or a new one when it
 * has none. The URL is rewritten to name it, so a reload stays on it.
 *
 * `list` is the open document's chats, served by `transport`.
 */
export function useWorkspaceTarget(
  list: UseAgentChatListResult,
  transport: ChatTransport | null
): ResolvedWorkspaceTarget {
  const { target, selectTarget } = useAIMode();
  const latest = target.kind === 'document' && target.chat === 'latest' ? target : null;
  // Right after a switch the listing still holds the previous document's chats.
  const listed = transport != null && list.scopeKey === transport.key && list.access === 'ok';

  useEffect(() => {
    if (latest == null || !listed) return;
    selectTarget(documentTarget(latest.noteId, mostRecentChat(list.chats)?.id ?? 'new'));
  }, [latest, listed, list.chats, selectTarget]);

  if (target.kind !== 'document') return { target, chatId: null, resolving: false };
  return {
    target,
    chatId: typeof target.chat === 'number' ? target.chat : null,
    resolving: target.chat === 'latest',
  };
}
