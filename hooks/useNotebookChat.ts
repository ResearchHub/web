'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NotebookChatService,
  NOTEBOOK_CHAT_MESSAGE_MAX_LENGTH,
} from '@/services/notebookChat.service';
import { ApiError } from '@/services/types/api';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import {
  editedNoteVersionId,
  isNotebookChatExecutionActive,
  type NotebookChatConversation,
  type NotebookChatExecution,
} from '@/types/notebookChat';

const CHAT_POLL_INTERVAL_MS = 3000;

const BUSY_MESSAGE = 'The assistant is still working on a previous message.';

export interface UseNotebookChatState {
  conversation: NotebookChatConversation | null;
  /** Initial conversation fetch for this note. */
  isLoading: boolean;
  loadError: string | null;
  /** POST of a new message is in flight. */
  isSending: boolean;
  sendError: string | null;
  /** Message shown optimistically while its POST is in flight. */
  pendingMessage: string | null;
  /** A turn is running (from send through the agent finishing). */
  isAssistantWorking: boolean;
  /** Terminal error of the latest turn, when it produced no reply. */
  turnError: string | null;
  /**
   * Newest turn. While `isAssistantWorking` this is the running one, so its
   * activity is the live progress; when it failed, the activity is the only
   * account of how far it got.
   */
  latestExecution: NotebookChatExecution | null;
  /** Executions by id, for joining an assistant message to its activity. */
  executionsById: Map<number, NotebookChatExecution>;
}

export interface UseNotebookChatActions {
  sendMessage: (text: string) => Promise<boolean>;
  clearSendError: () => void;
}

type UseNotebookChatReturn = [UseNotebookChatState, UseNotebookChatActions];

/** What a finished turn changed, for callers deciding whether to react. */
export interface NotebookChatTurnSummary {
  /** Version the turn saved to the note, or null if it wrote nothing. */
  editedNoteVersionId: number | null;
}

function latestExecution(
  conversation: NotebookChatConversation | null
): NotebookChatExecution | null {
  const executions = conversation?.executions;
  if (!executions || executions.length === 0) return null;
  return executions[executions.length - 1];
}

/**
 * State for one note's assistant chat: loads the conversation, submits
 * messages, and polls while an agent turn is running. `onTurnSettled` fires
 * once each time a running turn is observed reaching a terminal state, and
 * reports the note version the turn saved so callers can refresh only when
 * the agent actually wrote something.
 */
export function useNotebookChat(
  noteId: string | null,
  options?: { enabled?: boolean; onTurnSettled?: (summary: NotebookChatTurnSummary) => void }
): UseNotebookChatReturn {
  const enabled = options?.enabled ?? true;

  const [conversation, setConversation] = useState<NotebookChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const onTurnSettledRef = useRef(options?.onTurnSettled);
  useEffect(() => {
    onTurnSettledRef.current = options?.onTurnSettled;
  }, [options?.onTurnSettled]);

  // Track whether the latest execution was active on the previous observation,
  // so settling fires exactly once per turn — and never for a conversation
  // that loads already settled.
  const wasActiveRef = useRef(false);

  const applyConversation = useCallback((next: NotebookChatConversation) => {
    setConversation(next);
    const execution = latestExecution(next);
    const active = execution != null && isNotebookChatExecutionActive(execution);
    if (wasActiveRef.current && !active) {
      onTurnSettledRef.current?.({
        editedNoteVersionId: execution ? editedNoteVersionId(execution) : null,
      });
    }
    wasActiveRef.current = active;
  }, []);

  // Reset per-note state when switching notes.
  useEffect(() => {
    setConversation(null);
    setLoadError(null);
    setSendError(null);
    setPendingMessage(null);
    wasActiveRef.current = false;
  }, [noteId]);

  // Initial load.
  useEffect(() => {
    if (!noteId || !enabled) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    NotebookChatService.getConversation(noteId)
      .then((loaded) => {
        if (cancelled) return;
        applyConversation(loaded);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(extractApiErrorMessage(err, 'Failed to load the assistant conversation'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [noteId, enabled, applyConversation]);

  // Poll while the latest turn is active.
  const latestTurn = latestExecution(conversation);
  const shouldPoll =
    enabled && noteId != null && latestTurn != null
      ? isNotebookChatExecutionActive(latestTurn)
      : false;

  useEffect(() => {
    if (!shouldPoll || !noteId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await NotebookChatService.getConversation(noteId);
        if (cancelled) return;
        applyConversation(next);
      } catch {
        // Transient poll failure — keep the interval running and retry.
      }
    };
    const interval = setInterval(poll, CHAT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [shouldPoll, noteId, applyConversation]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!noteId || !trimmed || isSending) return false;
      if (trimmed.length > NOTEBOOK_CHAT_MESSAGE_MAX_LENGTH) {
        setSendError(
          `Message is too long (max ${NOTEBOOK_CHAT_MESSAGE_MAX_LENGTH.toLocaleString()} characters).`
        );
        return false;
      }

      setIsSending(true);
      setSendError(null);
      setPendingMessage(trimmed);
      try {
        await NotebookChatService.sendMessage(noteId, trimmed);
        // The user message and RUNNING execution are recorded synchronously,
        // so this fetch replaces the optimistic bubble with server state and
        // switches the poll on.
        const next = await NotebookChatService.getConversation(noteId);
        applyConversation(next);
        setPendingMessage(null);
        return true;
      } catch (err: unknown) {
        setPendingMessage(null);
        if (err instanceof ApiError && err.status === 409) {
          setSendError(BUSY_MESSAGE);
        } else {
          setSendError(extractApiErrorMessage(err, 'Failed to send message'));
        }
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [noteId, isSending, applyConversation]
  );

  const clearSendError = useCallback(() => setSendError(null), []);

  const isAssistantWorking = isSending || shouldPoll;
  const turnError = !isAssistantWorking && latestTurn?.error ? latestTurn.error.message : null;

  const executions = conversation?.executions;
  const executionsById = useMemo(
    () => new Map((executions ?? []).map((execution) => [execution.id, execution])),
    [executions]
  );

  return [
    {
      conversation,
      isLoading,
      loadError,
      isSending,
      sendError,
      pendingMessage,
      isAssistantWorking,
      turnError,
      latestExecution: latestTurn,
      executionsById,
    },
    { sendMessage, clearSendError },
  ];
}
