'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, type DebouncedFunc } from 'lodash-es';
import {
  NotebookChatService,
  chatErrorDetail,
  chatErrorStatus,
} from '@/services/notebookChat.service';
import { useNotebookChatSocket, type ChatSocketStatus } from '@/hooks/useNotebookChatSocket';
import {
  isActiveExecutionStatus,
  type ChatExecution,
  type ChatSocketEvent,
  type NotebookChat,
  type NotebookChatListItem,
} from '@/types/notebookChat';

/** Fallback poll cadence while a turn runs; the socket nudge usually wins. */
const POLL_INTERVAL_MS = 5000;
/** Socket events are advisory nudges — collapse bursts into one refetch. */
const NUDGE_DEBOUNCE_MS = 250;

export type ChatAccess = 'loading' | 'ok' | 'not_found' | 'unauthorized' | 'error';

export type SendOutcome =
  | { ok: true }
  | { ok: false; reason: 'busy' | 'invalid' | 'not_found' | 'error'; detail?: string };

/** Maps a failed send POST to its outcome; the state side-effects stay in `send`. */
function sendFailureOutcome(err: unknown): Extract<SendOutcome, { ok: false }> {
  const detail = chatErrorDetail(err);
  switch (chatErrorStatus(err)) {
    case 409:
      return { ok: false, reason: 'busy', detail };
    case 400:
      return { ok: false, reason: 'invalid', detail };
    case 404:
      return { ok: false, reason: 'not_found', detail };
    default:
      return { ok: false, reason: 'error', detail };
  }
}

export interface PendingSend {
  text: string;
  /** Set once the POST 202s; cleared when the execution shows up in a refetch. */
  executionId: number | null;
}

/**
 * Merge a `?activity=live` response over the cached chat.
 *
 * Everything except `activity` is replaced wholesale. `activity` follows the
 * server's omission contract: an absent key means "unchanged — keep the cached
 * copy", while a present key (even `[]`, a turn that used no tools) replaces
 * it. After the merge every execution carries a concrete `activity` array so
 * the UI never has to reason about the omission again.
 */
function mergeLiveChat(prev: NotebookChat | null, next: NotebookChat): NotebookChat {
  const cachedActivity = new Map<number, ChatExecution['activity']>(
    (prev?.executions ?? []).map((execution) => [execution.id, execution.activity])
  );

  return {
    ...next,
    executions: next.executions.map((execution) =>
      execution.activity !== undefined
        ? execution
        : { ...execution, activity: cachedActivity.get(execution.id) ?? [] }
    ),
  };
}

interface UseNotebookChatOptions {
  noteId: string | number | null;
  chatId: number | null;
  /** False while the panel is closed — suspends fetching, polling, and the socket. */
  enabled: boolean;
  /**
   * Seed data for a chat we just created via POST (its full representation) —
   * saves a redundant GET and makes the composer usable immediately.
   */
  initialChat?: NotebookChat | null;
}

export interface UseNotebookChatResult {
  chat: NotebookChat | null;
  access: ChatAccess;
  /** Newest execution (executions are ordered oldest → newest). */
  latestExecution: ChatExecution | null;
  /** Newest execution is PENDING/RUNNING, or a send is in flight. */
  isBusy: boolean;
  /** A turn SUCCEEDED but its answer hasn't been published to `messages` yet. */
  isFinishing: boolean;
  pendingSend: PendingSend | null;
  socketStatus: ChatSocketStatus;
  send: (text: string) => Promise<SendOutcome>;
  cancel: () => Promise<void>;
  rename: (title: string) => Promise<boolean>;
  refetch: () => void;
}

/**
 * State machine for one open chat. REST is the source of truth: the first load
 * is a full GET, every subsequent refresh is `?activity=live` merged via
 * {@link mergeLiveChat}. The socket and the poll loop both funnel into the
 * same refetch, so dropped/duplicated/reordered events can only ever delay
 * data, never corrupt it.
 */
export function useNotebookChat({
  noteId,
  chatId,
  enabled,
  initialChat = null,
}: UseNotebookChatOptions): UseNotebookChatResult {
  const [chat, setChat] = useState<NotebookChat | null>(null);
  const [access, setAccess] = useState<ChatAccess>('loading');
  const [pendingSend, setPendingSend] = useState<PendingSend | null>(null);

  // Monotonic fetch sequence: any response that isn't the newest request for
  // the current chat is discarded, so slow responses can't clobber fresh data.
  const seqRef = useRef(0);
  // Bumped by the reset effect whenever the target chat changes (or the panel
  // closes). send/cancel/rename capture it before their request and skip state
  // updates if it moved — a continuation bound to the previous chat must not
  // touch the new chat's state or start refetches that outrace its first load.
  const epochRef = useRef(0);
  // Chat id whose `initialChat` seed has been consumed. The creation snapshot
  // is only trustworthy at the moment of creation — any later reset pass
  // (panel reopen, switch-back) must fetch, or the transcript would silently
  // revert to the empty creation state with no poll/socket path to recover.
  const seededChatIdRef = useRef<number | null>(null);
  // Mirror of `chat` for non-reactive reads inside fetchChat.
  const chatRef = useRef<NotebookChat | null>(null);
  chatRef.current = chat;

  const fetchChat = useCallback(
    async (mode: 'full' | 'live') => {
      if (noteId == null || chatId == null) return;
      // A live fetch may omit activity we're expected to already hold — only
      // safe when we actually hold a cached copy to merge over.
      const live = mode === 'live' && chatRef.current != null;
      const seq = ++seqRef.current;
      try {
        const data = await NotebookChatService.getChat(noteId, chatId, { live });
        if (seq !== seqRef.current) return;
        setChat((prev) => mergeLiveChat(live ? prev : null, data));
        setAccess('ok');
      } catch (err) {
        if (seq !== seqRef.current) return;
        const status = chatErrorStatus(err);
        if (status === 404) {
          setAccess('not_found');
          setChat(null);
        } else if (status === 401 || status === 403) {
          setAccess('unauthorized');
          setChat(null);
        } else {
          // Transient/network failure: keep showing cached data if we have it.
          setAccess((prev) => (prev === 'ok' ? 'ok' : 'error'));
        }
      }
    },
    [noteId, chatId]
  );

  // Reset + initial load whenever the target chat changes or the panel opens.
  useEffect(() => {
    seqRef.current += 1; // invalidate any in-flight response for the old chat
    epochRef.current += 1; // …and any pending send/cancel/rename continuation
    setPendingSend(null);
    if (!enabled || noteId == null || chatId == null) {
      setChat(null);
      setAccess('loading');
      return;
    }
    if (initialChat?.conversation_id === chatId && seededChatIdRef.current !== chatId) {
      seededChatIdRef.current = chatId;
      setChat(mergeLiveChat(null, initialChat));
      setAccess('ok');
      return;
    }
    setChat(null);
    setAccess('loading');
    fetchChat('full');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, chatId, enabled, fetchChat]);

  const latestExecution = useMemo(
    () => (chat && chat.executions.length > 0 ? chat.executions[chat.executions.length - 1] : null),
    [chat]
  );

  const isTurnActive = latestExecution != null && isActiveExecutionStatus(latestExecution.status);
  // Publication can lag a beat behind SUCCEEDED on any execution; keep polling
  // until the repair lands so we never render "done" without the answer.
  const hasPendingAnswer = useMemo(
    () =>
      (chat?.executions ?? []).some(
        (execution) => execution.status === 'SUCCEEDED' && execution.assistant_message_pending
      ),
    [chat]
  );

  const isBusy = isTurnActive || pendingSend !== null;
  const isFinishing = !isTurnActive && hasPendingAnswer;

  // Once the refetched executions include the 202's execution id, the durable
  // transcript owns the user bubble and the optimistic copy retires.
  useEffect(() => {
    if (!pendingSend?.executionId || !chat) return;
    if (chat.executions.some((execution) => execution.id === pendingSend.executionId)) {
      setPendingSend(null);
    }
  }, [chat, pendingSend]);

  // Polling fallback while anything is in flight. With a healthy socket the
  // nudge almost always refetches first; without one this keeps the UI live.
  useEffect(() => {
    if (!enabled || access !== 'ok') return;
    if (!isBusy && !isFinishing) return;
    const timer = setInterval(() => fetchChat('live'), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, access, isBusy, isFinishing, fetchChat]);

  // Debounced socket nudge → live refetch. Every event kind is handled
  // identically; the refetched status is what we trust.
  const nudgeRef = useRef<DebouncedFunc<() => void> | null>(null);
  useEffect(() => {
    const nudge = debounce(() => fetchChat('live'), NUDGE_DEBOUNCE_MS);
    nudgeRef.current = nudge;
    return () => nudge.cancel();
  }, [fetchChat]);

  const handleSocketEvent = useCallback((_event: ChatSocketEvent) => {
    nudgeRef.current?.();
  }, []);

  const handleSocketReconnect = useCallback(() => {
    fetchChat('live');
  }, [fetchChat]);

  const socketStatus = useNotebookChatSocket({
    noteId,
    chatId,
    // "Connect after the chat exists": wait for the first successful GET.
    enabled: enabled && access === 'ok',
    onEvent: handleSocketEvent,
    onReconnect: handleSocketReconnect,
  });

  const send = useCallback(
    async (text: string): Promise<SendOutcome> => {
      if (noteId == null || chatId == null) return { ok: false, reason: 'error' };
      const epoch = epochRef.current;
      setPendingSend({ text, executionId: null });
      try {
        const response = await NotebookChatService.sendMessage(noteId, chatId, text);
        if (epoch === epochRef.current) {
          setPendingSend({ text, executionId: response.execution_id });
          fetchChat('live');
        }
        return { ok: true };
      } catch (err) {
        const outcome = sendFailureOutcome(err);
        // The outcome is still reported either way, but a continuation for a
        // chat that is no longer selected must not mutate the current one.
        if (epoch === epochRef.current) {
          setPendingSend(null);
          // Raced an active turn — refetch so the busy state renders truthfully.
          if (outcome.reason === 'busy') fetchChat('live');
          if (outcome.reason === 'not_found') setAccess('not_found');
        }
        return outcome;
      }
    },
    [noteId, chatId, fetchChat]
  );

  const cancel = useCallback(async () => {
    if (noteId == null || chatId == null) return;
    const epoch = epochRef.current;
    try {
      // Idempotent by design — "nothing was running" resolves, not throws.
      await NotebookChatService.cancelTurn(noteId, chatId);
    } catch {
      // Fall through: the refetch below renders whatever actually happened.
    }
    if (epoch === epochRef.current) fetchChat('live');
  }, [noteId, chatId, fetchChat]);

  const rename = useCallback(
    async (title: string): Promise<boolean> => {
      if (noteId == null || chatId == null) return false;
      const epoch = epochRef.current;
      try {
        const response = await NotebookChatService.renameChat(noteId, chatId, title);
        if (epoch === epochRef.current) {
          setChat((prev) => (prev ? { ...prev, title: response.title } : prev));
        }
        return true;
      } catch {
        return false;
      }
    },
    [noteId, chatId]
  );

  const refetch = useCallback(() => {
    fetchChat('live');
  }, [fetchChat]);

  return {
    chat,
    access,
    latestExecution,
    isBusy,
    isFinishing,
    pendingSend,
    socketStatus,
    send,
    cancel,
    rename,
    refetch,
  };
}

export type ChatListAccess = 'loading' | 'ok' | 'hidden' | 'error';

export interface UseNotebookChatListResult {
  chats: NotebookChatListItem[];
  access: ChatListAccess;
  refresh: () => Promise<void>;
  createChat: (title?: string) => Promise<NotebookChat | null>;
}

/**
 * The chat picker's listing. Uses the cheap listing projection only — never
 * full chat fetches. 401/403/404 collapse to `hidden`: the server-side gate is
 * authoritative and the UI entry point simply disappears.
 */
export function useNotebookChatList(
  noteId: string | number | null,
  enabled: boolean
): UseNotebookChatListResult {
  const [chats, setChats] = useState<NotebookChatListItem[]>([]);
  const [access, setAccess] = useState<ChatListAccess>('loading');
  const seqRef = useRef(0);
  // Same stale-continuation guard as the chat hook: a createChat bound to a
  // previous note must not refresh (or hide) the current note's listing.
  const epochRef = useRef(0);

  const refresh = useCallback(async () => {
    if (noteId == null) return;
    const seq = ++seqRef.current;
    try {
      const items = await NotebookChatService.listChats(noteId);
      if (seq !== seqRef.current) return;
      setChats(items);
      setAccess('ok');
    } catch (err) {
      if (seq !== seqRef.current) return;
      const status = chatErrorStatus(err);
      if (status === 401 || status === 403 || status === 404) {
        setAccess('hidden');
      } else {
        setAccess((prev) => (prev === 'ok' ? 'ok' : 'error'));
      }
    }
  }, [noteId]);

  useEffect(() => {
    seqRef.current += 1;
    epochRef.current += 1;
    setChats([]);
    setAccess('loading');
    if (enabled && noteId != null) {
      refresh();
    }
  }, [noteId, enabled, refresh]);

  const createChat = useCallback(
    async (title?: string): Promise<NotebookChat | null> => {
      if (noteId == null) return null;
      const epoch = epochRef.current;
      try {
        const chat = await NotebookChatService.createChat(noteId, title);
        if (epoch === epochRef.current) refresh();
        return chat;
      } catch (err) {
        const status = chatErrorStatus(err);
        if ((status === 401 || status === 403) && epoch === epochRef.current) {
          setAccess('hidden');
        }
        return null;
      }
    },
    [noteId, refresh]
  );

  return { chats, access, refresh, createChat };
}
