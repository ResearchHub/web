'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAIMode, type WorkspaceTarget } from './AIModeContext';
import { getChatTransport } from '@/services/chatTransport';
import { useAgentChatList, type UseAgentChatListResult } from '@/hooks/useAgentChat';
import { useChatSession, type ChatSession } from '@/hooks/useChatSession';
import type { ChatNoticePolicy } from '@/components/AgentChat/chatNotices';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import type { AgentChatListItem, ChatNoteRef, AgentChat } from '@/types/agentChat';
import type { SelectedGrantDetails } from '@/types/grant';
import { useFundingIntent } from './start/useFundingIntent';

/** Matches the chat hook's own poll cadence, so a background turn's spinner clears as fast as the open one. */
const LIST_POLL_INTERVAL_MS = 5000;

const NOTICES: ChatNoticePolicy = { noun: 'conversation', usageLimit: 'inline' };

export interface AIModeChatState extends ChatSession {
  readonly target: WorkspaceTarget;
  readonly chatId: number | null;
  /** Every conversation the user has, the notebook's included. */
  readonly list: UseAgentChatListResult;
  /**
   * What the next conversation is for; sent with its creation. Set by the
   * door the workspace was opened through, else the last one used.
   */
  readonly intent: FundingIntent;
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
   * chat's from what is loaded, any other's from one detail fetch. A chat on
   * a document created nothing; the document is not its to delete.
   */
  readonly notesForChat: (chatId: number) => Promise<ChatNoteRef[]>;
  /** Open a listed conversation where it lives: on its own, or on its document. */
  readonly selectConversation: (item: AgentChatListItem) => void;
  readonly startNewChat: () => void;
  /** The document the open target is about, if it has one. */
  readonly note: ChatNoteRef | null;
  /**
   * The title to show for a conversation: a rename the user just made, shown
   * before the server confirms it, else the given fallback.
   */
  readonly titleFor: (chatId: number, fallback: string | null) => string | null;
}

/**
 * Orchestration for the workspace: the sidebar's list, the open target's
 * session, selection through the URL, renames and deletes. The session
 * itself — the chat, its draft and the send path — is `useChatSession`,
 * shared with the notebook's panel; here it runs on the assistant's
 * transport for a conversation and on the note's for a document.
 */
export function useAIModeChat(): AIModeChatState {
  const { target, selectTarget, selectChat, takePendingIntent } = useAIMode();
  const { chatId } = target;
  const targetNoteId = target.kind === 'document' ? target.noteId : null;
  const transport = getChatTransport({ noteId: targetNoteId });

  // The sidebar lists every conversation, whichever surface the open one is on.
  const list = useAgentChatList(getChatTransport({ noteId: null }), true);
  const refreshList = list.refresh;
  const listRef = useRef(list.chats);
  listRef.current = list.chats;
  /** The transport a listed conversation is served by. */
  const transportFor = useCallback((id: number) => {
    const item = listRef.current.find((chat) => chat.id === id);
    const noteId = item?.workflow === 'notebook_chat' ? (item.note?.id ?? null) : null;
    return getChatTransport({ noteId });
  }, []);

  // ---- what the next conversation starts out knowing ----
  const [intent, setIntent] = useFundingIntent();
  const [selectedGrant, setSelectedGrant] = useState<SelectedGrantDetails | null>(null);
  const createInitRef = useRef({ intent, selectedGrant });
  createInitRef.current = { intent, selectedGrant };
  const getCreateInit = useCallback(() => {
    const { intent: current, selectedGrant: grant } = createInitRef.current;
    return { intent: current, selectedGrantId: grant?.id ?? null };
  }, []);

  const targetRef = useRef(target);
  targetRef.current = target;
  const onChatCreated = useCallback(
    (created: AgentChat) => {
      const current = targetRef.current;
      if (current.kind === 'document') {
        // The chat stays on its document, laid out as it was.
        selectTarget({ ...current, chatId: created.conversation_id });
        return;
      }
      // The RFP went with the conversation it was picked for.
      setSelectedGrant(null);
      selectChat(created.conversation_id);
    },
    [selectTarget, selectChat]
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

  // ---- the door the workspace was opened through ----
  // A Publish menu item or a New RFP / New proposal button opens it for one
  // side of the money; the start screen takes that side rather than asking.
  useEffect(() => {
    if (target.kind !== 'conversation' || target.chatId != null) return;
    const pending = takePendingIntent();
    if (pending) setIntent(pending);
  }, [target, takePendingIntent, setIntent]);
  const chatRef = useRef(chat.chat);
  chatRef.current = chat.chat;

  // ---- selection ----
  const selectConversation = useCallback(
    (item: AgentChatListItem) => {
      if (item.workflow === 'notebook_chat' && item.note) {
        // Opened as a conversation: the chat comes first, its document beside it.
        selectTarget({ kind: 'document', noteId: item.note.id, chatId: item.id, layout: 'chat' });
      } else {
        selectChat(item.id);
      }
    },
    [selectTarget, selectChat]
  );
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

  // ---- renames, shown before the server confirms them ----
  // A rename is the user's own words; making them wait for the PATCH just
  // flashes the old title back at them. The override shows at once and is
  // dropped when the listing catches up, or rolled back if the save fails.
  const [pendingTitles, setPendingTitles] = useState<Map<number, string>>(() => new Map());
  const setPendingTitle = useCallback((id: number, title: string | null) => {
    setPendingTitles((prev) => {
      if (title == null ? !prev.has(id) : prev.get(id) === title) return prev;
      const next = new Map(prev);
      if (title == null) next.delete(id);
      else next.set(id, title);
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
    (id: number, fallback: string | null) => pendingTitles.get(id) ?? fallback,
    [pendingTitles]
  );

  const rename = useCallback(
    async (id: number, title: string): Promise<boolean> => {
      setPendingTitle(id, title);
      let renamed: boolean;
      if (id === targetRef.current.chatId) {
        // The open chat's hook keeps its own copy of the title in sync.
        renamed = await chat.rename(title);
      } else {
        try {
          await transportFor(id).renameChat(id, title);
          renamed = true;
        } catch {
          renamed = false;
        }
      }
      if (renamed) refreshList();
      else setPendingTitle(id, null);
      return renamed;
    },
    [chat, transportFor, refreshList, setPendingTitle]
  );

  const notesForChat = useCallback(
    async (id: number): Promise<ChatNoteRef[]> => {
      const item = listRef.current.find((c) => c.id === id);
      if (item?.workflow === 'notebook_chat') return [];
      if (id === targetRef.current.chatId && chatRef.current?.conversation_id === id) {
        return chatRef.current.notes ?? [];
      }
      try {
        return (await transportFor(id).getChat(id)).notes ?? [];
      } catch {
        return [];
      }
    },
    [transportFor]
  );

  const deleteChat = useCallback(
    async (id: number, options?: { deleteNotes?: boolean }): Promise<boolean> => {
      try {
        await transportFor(id).deleteChat(id, options);
      } catch {
        return false;
      }
      if (targetRef.current.chatId === id) selectChat(null);
      refreshList();
      return true;
    },
    [transportFor, selectChat, refreshList]
  );

  // ---- the document the target is about ----
  // A conversation's is the first note it created, which its own detail
  // reports and its listing row remembers between loads; a document target's
  // is the document itself, titled from whatever the list knows of it.
  const firstNote = chat.chat?.notes?.[0] ?? null;
  const note = useMemo<ChatNoteRef | null>(() => {
    if (target.kind === 'document') {
      const listed = list.chats.find((item) => item.note?.id === target.noteId)?.note;
      return { id: target.noteId, title: listed?.title ?? '' };
    }
    if (target.chatId == null) return null;
    return firstNote ?? list.chats.find((item) => item.id === target.chatId)?.note ?? null;
  }, [target, firstNote, list.chats]);

  return {
    ...session,
    target,
    chatId,
    list,
    intent,
    selectedGrant,
    setSelectedGrant,
    rename,
    deleteChat,
    notesForChat,
    selectConversation,
    startNewChat,
    note,
    titleFor,
  };
}
