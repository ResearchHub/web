'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAIMode } from './AIModeContext';
import { getChatTransport } from '@/services/chatTransport';
import { useAgentChatList, type UseAgentChatListResult } from '@/hooks/useAgentChat';
import { useChatSession, type ChatSession } from '@/hooks/useChatSession';
import type { ChatNoticePolicy } from '@/components/AgentChat/chatNotices';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import type { ChatNoteRef, AgentChat } from '@/types/agentChat';
import type { SelectedGrantDetails } from '@/types/grant';
import { useFundingIntent } from './start/useFundingIntent';

/** Matches the chat hook's own poll cadence, so a background turn's spinner clears as fast as the open one. */
const LIST_POLL_INTERVAL_MS = 5000;

const NOTICES: ChatNoticePolicy = { noun: 'conversation', usageLimit: 'inline' };

export interface AIModeChatState extends ChatSession {
  readonly chatId: number | null;
  readonly list: UseAgentChatListResult;
  /** What the next conversation is for; sent with its creation. */
  readonly intent: FundingIntent;
  readonly setIntent: (intent: FundingIntent) => void;
  /** The RFP the next conversation's proposal answers, chosen on the start screen. */
  readonly selectedGrant: SelectedGrantDetails | null;
  readonly setSelectedGrant: (grant: SelectedGrantDetails | null) => void;
  /** Rename any conversation, open or not. */
  readonly rename: (chatId: number, title: string) => Promise<boolean>;
  /**
   * Delete any conversation, optionally with the notes it created; deleting
   * the open one lands on the new-conversation screen.
   */
  readonly deleteChat: (chatId: number, options?: { deleteNotes?: boolean }) => Promise<boolean>;
  /**
   * The notes a conversation created, for the delete confirmation: the open
   * chat's from what is loaded, any other's from one detail fetch.
   */
  readonly notesForChat: (chatId: number) => Promise<ChatNoteRef[]>;
  readonly selectChat: (chatId: number | null) => void;
  readonly startNewChat: () => void;
  /** The first note of every conversation whose detail this session has loaded. */
  readonly notesByChat: ReadonlyMap<number, ChatNoteRef>;
  /** The active conversation's document, if it has one. */
  readonly note: ChatNoteRef | null;
  /**
   * The title to show for a conversation: a rename the user just made, shown
   * before the server confirms it, else the given fallback.
   */
  readonly titleFor: (chatId: number, fallback: string | null) => string | null;
}

/**
 * Orchestration for the overlay: the sidebar's list, the open chat's session,
 * selection through the URL, renames and deletes. The session itself — the
 * chat, its draft and the send path — is `useChatSession`, shared with the
 * notebook's panel.
 */
export function useAIModeChat(): AIModeChatState {
  const { chatId, selectChat: selectChatInUrl } = useAIMode();
  const transport = getChatTransport({ noteId: null });

  const list = useAgentChatList(transport, true);
  const refreshList = list.refresh;

  // ---- what the next conversation starts out knowing ----
  const [intent, setIntent] = useFundingIntent();
  const [selectedGrant, setSelectedGrant] = useState<SelectedGrantDetails | null>(null);
  const createInitRef = useRef({ intent, selectedGrant });
  createInitRef.current = { intent, selectedGrant };
  const getCreateInit = useCallback(() => {
    const { intent: current, selectedGrant: grant } = createInitRef.current;
    return { intent: current, selectedGrantId: grant?.id ?? null };
  }, []);

  const onChatCreated = useCallback(
    (created: AgentChat) => {
      // The RFP went with the conversation it was picked for.
      setSelectedGrant(null);
      selectChatInUrl(created.conversation_id);
    },
    [selectChatInUrl]
  );
  const session = useChatSession({
    transport,
    chatId,
    enabled: true,
    onChatCreated,
    onListStale: refreshList,
    getCreateInit,
    notices: NOTICES,
  });
  const { chat } = session;
  const chatRef = useRef(chat.chat);
  chatRef.current = chat.chat;
  const chatIdRef = useRef(chatId);
  chatIdRef.current = chatId;

  // ---- selection ----
  const selectChat = useCallback((next: number | null) => selectChatInUrl(next), [selectChatInUrl]);
  const startNewChat = useCallback(() => selectChat(null), [selectChat]);

  // ---- keep the listing fresh ----
  // The session refreshes it as the open chat's turns settle; poll while any
  // other conversation has a turn running, so its row spinner clears without
  // the user having to open it.
  const anyTurnActive = list.chats.some((item) => item.has_active_turn);
  useEffect(() => {
    if (!anyTurnActive) return;
    const timer = setInterval(() => {
      refreshList();
    }, LIST_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [anyTurnActive, refreshList]);

  // ---- document refs for the list badges ----
  const [notesByChat, setNotesByChat] = useState<Map<number, ChatNoteRef>>(() => new Map());
  const firstNote = chat.chat?.notes?.[0] ?? null;
  const firstNoteId = firstNote?.id ?? null;
  const firstNoteTitle = firstNote?.title ?? null;
  const loadedChatId = chat.chat?.conversation_id ?? null;
  useEffect(() => {
    if (loadedChatId == null || firstNoteId == null || firstNoteTitle == null) return;
    setNotesByChat((prev) => {
      const existing = prev.get(loadedChatId);
      if (existing?.id === firstNoteId && existing.title === firstNoteTitle) return prev;
      const next = new Map(prev);
      next.set(loadedChatId, { id: firstNoteId, title: firstNoteTitle });
      return next;
    });
  }, [loadedChatId, firstNoteId, firstNoteTitle]);

  // ---- renames, shown before the server confirms them ----
  // A rename is the user's own words; making them wait for the PATCH just
  // flashes the old title back at them. The override shows at once and is
  // dropped when the listing catches up, or rolled back if the save fails.
  const [pendingTitles, setPendingTitles] = useState<Map<number, string>>(() => new Map());
  const setPendingTitle = useCallback((target: number, title: string | null) => {
    setPendingTitles((prev) => {
      if (title == null ? !prev.has(target) : prev.get(target) === title) return prev;
      const next = new Map(prev);
      if (title == null) next.delete(target);
      else next.set(target, title);
      return next;
    });
  }, []);
  useEffect(() => {
    // Retire each override once the listing shows the confirmed title.
    for (const item of list.chats) {
      const pending = pendingTitles.get(item.id);
      if (pending != null && item.title === pending) setPendingTitle(item.id, null);
    }
  }, [list.chats, pendingTitles, setPendingTitle]);
  const titleFor = useCallback(
    (target: number, fallback: string | null) => pendingTitles.get(target) ?? fallback,
    [pendingTitles]
  );

  const rename = useCallback(
    async (target: number, title: string): Promise<boolean> => {
      setPendingTitle(target, title);
      let renamed: boolean;
      if (target === chatIdRef.current) {
        // The open chat's hook keeps its own copy of the title in sync.
        renamed = await chat.rename(title);
      } else {
        try {
          await transport.renameChat(target, title);
          renamed = true;
        } catch {
          renamed = false;
        }
      }
      if (renamed) refreshList();
      else setPendingTitle(target, null);
      return renamed;
    },
    [chat, transport, refreshList, setPendingTitle]
  );

  const notesForChat = useCallback(
    async (target: number): Promise<ChatNoteRef[]> => {
      if (target === chatIdRef.current && chatRef.current?.conversation_id === target) {
        return chatRef.current.notes ?? [];
      }
      try {
        return (await transport.getChat(target)).notes ?? [];
      } catch {
        return [];
      }
    },
    [transport]
  );

  const deleteChat = useCallback(
    async (target: number, options?: { deleteNotes?: boolean }): Promise<boolean> => {
      if (!transport.deleteChat) return false;
      try {
        await transport.deleteChat(target, options);
      } catch {
        return false;
      }
      if (chatIdRef.current === target) selectChat(null);
      refreshList();
      return true;
    },
    [transport, selectChat, refreshList]
  );

  const note = useMemo(() => {
    if (chatId == null) return null;
    return firstNote ?? notesByChat.get(chatId) ?? null;
  }, [chatId, firstNote, notesByChat]);

  return {
    ...session,
    chatId,
    list,
    intent,
    setIntent,
    selectedGrant,
    setSelectedGrant,
    rename,
    deleteChat,
    notesForChat,
    selectChat,
    startNewChat,
    notesByChat,
    note,
    titleFor,
  };
}
