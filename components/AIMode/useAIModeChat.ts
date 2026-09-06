'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAIMode } from './AIModeContext';
import { assistantChatTransport } from '@/services/chatTransport';
import { AssistantChatService } from '@/services/assistantChat.service';
import {
  useNotebookChat,
  useNotebookChatList,
  type SendOutcome,
  type UseNotebookChatListResult,
  type UseNotebookChatResult,
} from '@/hooks/useNotebookChat';
import { useAgentModelSelection, type AgentModelSelection } from '@/hooks/useAgentModelSelection';
import type { ChatNoteRef, NotebookChat } from '@/types/notebookChat';
import type { GenerationRequest } from '@/types/notebookModels';
import type { ComposerNotice } from '@/components/AgentChat/ChatComposer';

/** Matches the chat hook's own poll cadence, so a background turn's spinner clears as fast as the open one. */
const LIST_POLL_INTERVAL_MS = 5000;

interface QueuedMessage {
  text: string;
  generation: GenerationRequest;
}

function formatResetTime(iso: unknown): string | null {
  if (typeof iso !== 'string') return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/**
 * Composer copy for a failed send. Server `detail` is rendered verbatim
 * wherever it exists; the fallbacks only cover bodies without one.
 */
function noticeFromOutcome(outcome: SendOutcome & { ok: false }): ComposerNotice {
  switch (outcome.reason) {
    case 'busy':
      if (outcome.code === 'usage_work_in_progress') {
        return {
          tone: 'warning',
          text:
            outcome.detail ??
            'Another assistant task of yours is still running elsewhere. Wait for it to finish, then try again.',
        };
      }
      return {
        tone: 'warning',
        text: outcome.detail ?? 'The assistant is still working on a previous message.',
      };
    case 'limit': {
      const resetsAt = formatResetTime(outcome.body?.resets_at);
      return {
        tone: 'warning',
        text: resetsAt
          ? `You’ve used today’s assistant budget. It resets at ${resetsAt}.`
          : (outcome.detail ?? 'You’ve used today’s assistant budget. Try again after it resets.'),
      };
    }
    case 'invalid':
      return { tone: 'error', text: outcome.detail ?? 'That message can’t be sent.' };
    case 'not_found':
      return { tone: 'error', text: 'This conversation is no longer available.' };
    case 'unauthorized':
      return {
        tone: 'error',
        text: outcome.detail ?? 'You don’t have access to the assistant.',
      };
    default:
      return {
        tone: 'error',
        text: outcome.detail ?? 'Something went wrong — your message wasn’t sent.',
      };
  }
}

export interface AIModeChatState {
  readonly chatId: number | null;
  readonly list: UseNotebookChatListResult;
  readonly chat: UseNotebookChatResult;
  readonly modelSelection: AgentModelSelection;
  readonly draft: string;
  readonly setDraft: (value: string) => void;
  readonly notice: ComposerNotice | null;
  readonly clearNotice: () => void;
  /** A brand-new chat is being created for the first message. */
  readonly creatingChat: boolean;
  readonly send: () => Promise<void>;
  readonly stop: () => Promise<void>;
  /** Rename any conversation, open or not. */
  readonly rename: (chatId: number, title: string) => Promise<boolean>;
  readonly selectChat: (chatId: number | null) => void;
  readonly startNewChat: () => void;
  /** The first note of every conversation whose detail this session has loaded. */
  readonly notesByChat: ReadonlyMap<number, ChatNoteRef>;
  /** The active conversation's document, if it has one. */
  readonly note: ChatNoteRef | null;
}

/**
 * Orchestration for the overlay: the list, the open chat, model selection,
 * per-chat drafts, and the send path. A conversation is only created on the
 * first send, so abandoned "new conversation" screens leave nothing behind.
 */
export function useAIModeChat(): AIModeChatState {
  const { chatId, selectChat: selectChatInUrl } = useAIMode();
  const transport = useMemo(() => assistantChatTransport(), []);

  const list = useNotebookChatList(transport, true);
  const [initialChat, setInitialChat] = useState<NotebookChat | null>(null);
  const chat = useNotebookChat({ transport, chatId, enabled: true, initialChat });
  const modelSelection = useAgentModelSelection({
    enabled: true,
    pinnedRef: chat.pinnedModelRef,
  });

  // ---- drafts (per chat, surviving switches and failed sends) ----
  const draftsRef = useRef(new Map<string, string>());
  const draftKey = chatId == null ? 'new' : String(chatId);
  const [draft, setDraftState] = useState('');
  const [notice, setNotice] = useState<ComposerNotice | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<QueuedMessage | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const creationSeqRef = useRef(0);

  const setDraft = useCallback(
    (value: string) => {
      draftsRef.current.set(draftKey, value);
      setDraftState(value);
    },
    [draftKey]
  );

  const prevDraftKeyRef = useRef(draftKey);
  useEffect(() => {
    if (prevDraftKeyRef.current === draftKey) return;
    prevDraftKeyRef.current = draftKey;
    setDraftState(draftsRef.current.get(draftKey) ?? '');
    setNotice(null);
  }, [draftKey]);

  // ---- selection ----
  const selectChat = useCallback(
    (next: number | null) => {
      setInitialChat(null);
      selectChatInUrl(next);
    },
    [selectChatInUrl]
  );
  const startNewChat = useCallback(() => selectChat(null), [selectChat]);

  // ---- keep the listing fresh ----
  // Derived titles land after the first turn; previews and spinners change as
  // turns settle. Refresh on those transitions of the open chat...
  const latestStatus = chat.latestExecution?.status ?? null;
  const chatTitle = chat.chat?.title ?? null;
  const refreshList = list.refresh;
  const prevListSignalRef = useRef<{ status: string | null; title: string | null }>({
    status: null,
    title: null,
  });
  useEffect(() => {
    const prev = prevListSignalRef.current;
    const changed = prev.status !== latestStatus || prev.title !== chatTitle;
    prevListSignalRef.current = { status: latestStatus, title: chatTitle };
    if (changed) refreshList();
  }, [latestStatus, chatTitle, refreshList]);

  // ...and poll while any other conversation has a turn running, so its row
  // spinner clears without the user having to open it.
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

  // ---- sending ----
  // Async continuations compare against the live target and discard results
  // that raced a chat switch instead of applying them to the new one.
  const targetRef = useRef<number | null>(chatId);
  targetRef.current = chatId;
  const isCurrentTarget = useCallback((target: number | null) => targetRef.current === target, []);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setNotice(null);
    const target = targetRef.current;
    const generation = modelSelection.request;

    if (chatId == null) {
      const creationSeq = ++creationSeqRef.current;
      setCreatingChat(true);
      const created = await list.createChat();
      if (creationSeqRef.current === creationSeq) setCreatingChat(false);
      if (!isCurrentTarget(target)) return;
      if (!created) {
        setNotice({
          tone: 'error',
          text: list.accessDetail ?? 'Couldn’t start a conversation. Please try again.',
        });
        return;
      }
      draftsRef.current.delete('new');
      setInitialChat(created);
      selectChatInUrl(created.conversation_id);
      setQueuedMessage({ text, generation });
      return;
    }

    const outcome = await chat.send(text, generation);
    if (outcome.ok) {
      if (isCurrentTarget(target)) {
        setDraft('');
      } else {
        draftsRef.current.delete(String(target));
      }
    } else if (isCurrentTarget(target)) {
      setNotice(noticeFromOutcome(outcome));
    }
  }, [
    draft,
    chatId,
    list,
    chat,
    modelSelection.request,
    setDraft,
    isCurrentTarget,
    selectChatInUrl,
  ]);

  // Fire the queued first message once the freshly created chat is live.
  const sendToChat = chat.send;
  useEffect(() => {
    if (queuedMessage == null || chatId == null || chat.access !== 'ok') return;
    const { text, generation } = queuedMessage;
    const target = targetRef.current;
    setQueuedMessage(null);
    sendToChat(text, generation).then((outcome) => {
      if (outcome.ok) return;
      if (isCurrentTarget(target)) {
        setNotice(noticeFromOutcome(outcome));
        setDraft(text);
      } else {
        draftsRef.current.set(String(target), text);
      }
    });
  }, [queuedMessage, chatId, chat.access, sendToChat, setDraft, isCurrentTarget]);

  const stop = chat.cancel;

  const rename = useCallback(
    async (target: number, title: string): Promise<boolean> => {
      if (target === targetRef.current) {
        // The open chat's hook keeps its own copy of the title in sync.
        const renamed = await chat.rename(title);
        if (renamed) refreshList();
        return renamed;
      }
      try {
        await transport.renameChat(target, title);
        refreshList();
        return true;
      } catch {
        return false;
      }
    },
    [chat, transport, refreshList]
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  // Surface the budget reset time on a 429 even when the body lacked it.
  useEffect(() => {
    if (
      notice?.tone !== 'warning' ||
      !notice.text.includes('budget') ||
      notice.text.includes('resets at')
    ) {
      return;
    }
    let cancelled = false;
    AssistantChatService.getUsageBudget()
      .then((budget) => {
        const resetsAt = formatResetTime(budget.resets_at);
        if (cancelled || !resetsAt) return;
        setNotice({
          tone: 'warning',
          text: `You’ve used today’s assistant budget. It resets at ${resetsAt}.`,
        });
      })
      .catch(() => {
        // The notice already says the budget is spent; the reset time is a bonus.
      });
    return () => {
      cancelled = true;
    };
  }, [notice]);

  const note = useMemo(() => {
    if (chatId == null) return null;
    return firstNote ?? notesByChat.get(chatId) ?? null;
  }, [chatId, firstNote, notesByChat]);

  return {
    chatId,
    list,
    chat,
    modelSelection,
    draft,
    setDraft,
    notice,
    clearNotice,
    creatingChat,
    send,
    stop,
    rename,
    selectChat,
    startNewChat,
    notesByChat,
    note,
  };
}
