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
  isChatStreamSocketEvent,
  isActiveExecutionStatus,
  type ChatExecution,
  type ChatExecutionStream,
  type ChatStreamDelta,
  type ChatStreamItem,
  type ChatStreamSocketEvent,
  type ChatSocketEvent,
  type NotebookChat,
  type NotebookChatListItem,
} from '@/types/notebookChat';

/** Fallback poll cadence while a turn runs; the socket nudge usually wins. */
const POLL_INTERVAL_MS = 5000;
/** Lifecycle events and stream repair requests collapse into one refetch. */
const NUDGE_DEBOUNCE_MS = 250;
const MAX_STREAM_NARRATION_CHARS = 100_000;
const MAX_STREAM_THINKING_CHARS = 4_000;

export type ChatAccess = 'loading' | 'ok' | 'not_found' | 'unauthorized' | 'error';

export type SendOutcome =
  | { ok: true }
  | {
      ok: false;
      reason: 'busy' | 'invalid' | 'not_found' | 'unauthorized' | 'error';
      detail?: string;
    };

/** Maps a failed send POST to its outcome; the state side-effects stay in `send`. */
function sendFailureOutcome(err: unknown): Extract<SendOutcome, { ok: false }> {
  const detail = chatErrorDetail(err);
  switch (chatErrorStatus(err)) {
    case 409:
      return { ok: false, reason: 'busy', detail };
    case 400:
      return { ok: false, reason: 'invalid', detail };
    case 401:
    case 403:
      return { ok: false, reason: 'unauthorized', detail };
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
 * The cached stream when it is the same stream a REST response checkpointed
 * but at a newer sequence — a checkpoint captured just before a socket batch
 * arrived must not rewind it. Null whenever the server copy is authoritative:
 * explicit `stream: null`, a new stream id, or a terminal execution.
 */
function newerCachedStream(
  execution: ChatExecution,
  cached: ChatExecution | undefined
): ChatExecutionStream | null {
  if (!isActiveExecutionStatus(execution.status)) return null;
  const serverStream = execution.stream;
  const cachedStream = cached?.stream;
  if (serverStream == null || cachedStream == null) return null;
  if (cachedStream.id !== serverStream.id) return null;
  return cachedStream.sequence > serverStream.sequence ? cachedStream : null;
}

/**
 * Merge a `?activity=live` response over the cached chat.
 *
 * `activity` follows the server's omission contract: an absent key means
 * "unchanged — keep the cached copy", while a present key (even `[]`, a turn
 * that used no tools) replaces it. Streams keep whichever of the cached and
 * server copies is newer, per {@link newerCachedStream}.
 */
function mergeLiveChat(prev: NotebookChat | null, next: NotebookChat): NotebookChat {
  const cachedExecutions = new Map<number, ChatExecution>(
    (prev?.executions ?? []).map((execution) => [execution.id, execution])
  );

  return {
    ...next,
    executions: next.executions.map((execution) => {
      const cached = cachedExecutions.get(execution.id);
      const activity = execution.activity ?? cached?.activity ?? [];
      const newerStream = newerCachedStream(execution, cached);
      return {
        ...execution,
        activity,
        ...(newerStream != null ? { stream: newerStream, phase: cached?.phase ?? null } : {}),
      };
    }),
  };
}

interface ApplyStreamEventResult {
  chat: NotebookChat | null;
  needsRepair: boolean;
}

/** Append one batch's deltas to a copy of `current`; null = corrupt frame. */
function appendStreamDeltas(
  current: readonly ChatStreamItem[],
  deltas: readonly ChatStreamDelta[]
): ChatStreamItem[] | null {
  const items = current.map((item) => ({ ...item }));
  for (const delta of deltas) {
    const maximum =
      delta.type === 'thinking' ? MAX_STREAM_THINKING_CHARS : MAX_STREAM_NARRATION_CHARS;
    const existing = items.find((item) => item.id === delta.id);
    if (existing == null) {
      items.push({
        id: delta.id,
        type: delta.type,
        text: delta.delta.slice(0, maximum),
        at: delta.at,
      });
    } else if (existing.type === delta.type) {
      existing.text = `${existing.text}${delta.delta}`.slice(0, maximum);
    } else {
      // An id changing type indicates an incompatible/corrupt frame. Recover
      // from the server checkpoint instead of combining unlike content.
      return null;
    }
  }
  return items;
}

/**
 * Append one sequenced socket batch. Duplicate/old batches are harmless; a
 * missing batch is never guessed and instead asks REST for its checkpoint.
 */
export function applyStreamEvent(
  chat: NotebookChat | null,
  event: ChatStreamSocketEvent
): ApplyStreamEventResult {
  if (chat?.conversation_id !== event.conversation_id) {
    return { chat, needsRepair: true };
  }

  const executionIndex = chat.executions.findIndex(
    (execution) => execution.id === event.execution_id
  );
  if (executionIndex < 0) return { chat, needsRepair: true };

  const execution = chat.executions[executionIndex];
  // A late frame must not resurrect a preview after the turn settled.
  if (!isActiveExecutionStatus(execution.status)) {
    return { chat, needsRepair: false };
  }

  const current = execution.stream;
  const continuing = current?.id === event.stream_id;
  if (continuing && event.sequence <= current.sequence) {
    return { chat, needsRepair: false };
  }
  const expectedSequence = continuing ? current.sequence + 1 : 1;
  if (event.sequence !== expectedSequence) {
    return { chat, needsRepair: true };
  }

  const items = appendStreamDeltas(continuing ? current.items : [], event.deltas);
  if (items == null) return { chat, needsRepair: true };

  const lastDelta = event.deltas.at(-1);
  const nextExecution: ChatExecution = {
    ...execution,
    stream: {
      id: event.stream_id,
      sequence: event.sequence,
      iteration: event.iteration,
      items,
    },
    phase:
      lastDelta?.type === 'narration'
        ? { state: 'responding', label: 'Writing a response' }
        : { state: 'thinking', label: 'Thinking' },
  };
  const executions = [...chat.executions];
  executions[executionIndex] = nextExecution;
  return { chat: { ...chat, executions }, needsRepair: false };
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
 * State machine for one open chat. REST is the durable source of truth and
 * carries a bounded transient stream checkpoint. Lifecycle socket events
 * trigger a live refetch; sequenced stream events append immediately. Polling,
 * reconnects, and any detected sequence gap repair from REST.
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
  // A sequence gap can produce more gap frames while its recovery GET runs.
  // Keep exactly one repair in flight rather than starting one per token.
  const streamRepairRef = useRef(false);
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
        setChat((prev) => {
          const merged = mergeLiveChat(live ? prev : null, data);
          chatRef.current = merged;
          return merged;
        });
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
    streamRepairRef.current = false;
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
    // Skip ticks while a poll is still in flight: with responses slower than
    // the interval, each new request would bump the fetch sequence and every
    // response would arrive already stale — the UI would sit busy forever.
    let inFlight = false;
    const timer = setInterval(() => {
      if (inFlight) return;
      inFlight = true;
      fetchChat('live').finally(() => {
        inFlight = false;
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, access, isBusy, isFinishing, fetchChat]);

  // Debounced lifecycle nudge / stream-gap repair → live refetch.
  const nudgeRef = useRef<DebouncedFunc<() => void> | null>(null);
  useEffect(() => {
    const nudge = debounce(() => fetchChat('live'), NUDGE_DEBOUNCE_MS);
    nudgeRef.current = nudge;
    return () => nudge.cancel();
  }, [fetchChat]);

  const repairStream = useCallback(() => {
    if (streamRepairRef.current) return;
    streamRepairRef.current = true;
    fetchChat('live').finally(() => {
      streamRepairRef.current = false;
    });
  }, [fetchChat]);

  const handleSocketEvent = useCallback(
    (event: ChatSocketEvent) => {
      if (event.conversation_id !== chatId) return;
      if (!isChatStreamSocketEvent(event)) {
        nudgeRef.current?.();
        return;
      }

      const current = chatRef.current;
      const applied = applyStreamEvent(current, event);
      if (applied.needsRepair) {
        repairStream();
        return;
      }
      if (applied.chat !== current) {
        // Keep burst frames ordered even when React batches their renders.
        chatRef.current = applied.chat;
        setChat(applied.chat);
      }
    },
    [chatId, repairStream]
  );

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
          // Session expired or permission revoked mid-chat: mirror what a
          // failed GET does so the access gate reacts instead of the composer
          // showing generic errors forever.
          if (outcome.reason === 'unauthorized') {
            setChat(null);
            setAccess('unauthorized');
          }
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
