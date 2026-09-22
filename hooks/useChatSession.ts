'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerNotice } from '@/components/AgentChat/ChatComposer';
import {
  budgetSpentNotice,
  isBudgetNoticeWithoutReset,
  noticeFromOutcome,
  type ChatNoticePolicy,
  type FailedSend,
} from '@/components/AgentChat/chatNotices';
import { useAgentChat, type UseAgentChatResult } from '@/hooks/useAgentChat';
import { useAgentModelSelection, type AgentModelSelection } from '@/hooks/useAgentModelSelection';
import { useResearchAI } from '@/hooks/useResearchAI';
import type { ChatCreateInit, ChatTransport } from '@/services/chatTransport';
import { chatErrorDetail } from '@/services/notebookChat.service';
import { isActiveExecutionStatus, type AgentChat } from '@/types/agentChat';
import type { GenerationRequest } from '@/types/agentModels';
import { canSelectAIModel } from '@/types/researchAI';

/**
 * A first message waiting on the chat it will start, holding the model choice
 * it was composed under so a later change can't retarget a send in flight,
 * and the session it belongs to so a switch can't fire it elsewhere.
 */
interface QueuedMessage {
  readonly sessionKey: string;
  readonly text: string;
  readonly generation: GenerationRequest;
}

export interface UseChatSessionOptions {
  /** The surface and scope the chat lives on; must be referentially stable. */
  readonly transport: ChatTransport;
  /** The open chat, or null for the new-chat screen. */
  readonly chatId: number | null;
  /** False while the surface is closed — suspends fetching and the socket. */
  readonly enabled: boolean;
  /** A chat was just created for the first message; the surface selects it. */
  readonly onChatCreated: (chat: AgentChat) => void;
  /** The chat's row in a listing may be out of date: a title landed, a turn settled. */
  readonly onListStale?: () => void;
  /** Extra fields for the chat the first message creates. */
  readonly getCreateInit?: () => ChatCreateInit | undefined;
  readonly notices: ChatNoticePolicy;
}

export interface ChatSession {
  readonly chat: UseAgentChatResult;
  readonly modelSelection: AgentModelSelection;
  readonly researchAI: ReturnType<typeof useResearchAI>;
  /** `transport:chat`, the identity a draft, a model choice and a send are bound to. */
  readonly sessionKey: string;
  readonly draft: string;
  readonly setDraft: (value: string) => void;
  readonly notice: ComposerNotice | null;
  readonly clearNotice: () => void;
  /** A brand-new chat is being created for the first message. */
  readonly creatingChat: boolean;
  /**
   * Sending would be refused: the allowance is unknown or spent, or a tier
   * that picks its model has no catalog yet to pick from.
   */
  readonly sendBlocked: boolean;
  /** The composer should wait: a turn, a send, a creation or the catalog is in flight. */
  readonly composerBusy: boolean;
  /** Something cancellable exists server-side. */
  readonly canStop: boolean;
  /** Send the given text, or the draft. Creates the chat first when there is none. */
  readonly send: (text?: string) => Promise<void>;
  readonly stop: () => Promise<void>;
}

const sessionKeyFor = (transport: ChatTransport, chatId: number | null) =>
  `${transport.key}:${chatId ?? 'new'}`;

/**
 * One chat surface's session: the open chat, its model selection, a draft per
 * chat that survives switches and failed sends, and the send path. A chat is
 * only created on the first send, so an abandoned new-chat screen leaves
 * nothing behind. Listing, selection and renames stay with the surface.
 */
export function useChatSession({
  transport,
  chatId,
  enabled,
  onChatCreated,
  onListStale,
  getCreateInit,
  notices,
}: UseChatSessionOptions): ChatSession {
  const sessionKey = sessionKeyFor(transport, chatId);

  // The creation response seeds the chat it created, and only that one: a
  // later visit to the same chat must fetch, or it would show the empty
  // creation state with nothing to move it on.
  const [createdChat, setCreatedChat] = useState<AgentChat | null>(null);
  const initialChat = createdChat?.conversation_id === chatId ? createdChat : null;
  const chat = useAgentChat({ transport, chatId, enabled, initialChat });

  // User-wide allowances and the model catalog load as soon as the surface
  // mounts, open or not, so the composer is ready when it shows; the
  // selection hook reads them from the same store rather than fetching again.
  const researchAI = useResearchAI(true);
  const hasModelSelection = canSelectAIModel(researchAI.budget?.tier);
  const canSelectModel = hasModelSelection && researchAI.catalog !== null;
  // A chat that has already run a turn is locked to the model it started on,
  // and reports it here; until then the API default decides.
  const modelSelection = useAgentModelSelection({
    enabled: false,
    canSelect: canSelectModel,
    conversationKey: sessionKey,
    locked:
      (chat.chat?.executions.length ?? 0) > 0 ||
      (chat.chat?.messages.length ?? 0) > 0 ||
      chat.pendingSend !== null,
    pinnedRef: chat.pinnedModelRef,
    effortPinned: chat.latestExecution != null,
    pinnedEffort: chat.latestExecution?.effort ?? null,
  });
  // A selectable tier must never submit its first turn without an authoritative
  // model; cached budget and catalog data stay usable through refresh failures.
  const sendBlocked =
    researchAI.budget === null ||
    researchAI.isSubmissionBlocked() ||
    (hasModelSelection && modelSelection.model === null);

  // ---- drafts (per session, surviving switches and failed sends) ----
  const draftsRef = useRef(new Map<string, string>());
  const [draft, setDraftState] = useState('');
  const [notice, setNotice] = useState<ComposerNotice | null>(null);
  const [queuedMessage, setQueuedMessage] = useState<QueuedMessage | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  /** Identity of the latest creation, so a stale settle can't clear its flag. */
  const creationSeqRef = useRef(0);

  const setDraft = useCallback(
    (value: string) => {
      draftsRef.current.set(sessionKey, value);
      setDraftState(value);
    },
    [sessionKey]
  );
  const clearNotice = useCallback(() => setNotice(null), []);

  const prevSessionKeyRef = useRef(sessionKey);
  useEffect(() => {
    if (prevSessionKeyRef.current === sessionKey) return;
    prevSessionKeyRef.current = sessionKey;
    setDraftState(draftsRef.current.get(sessionKey) ?? '');
    setNotice(null);
  }, [sessionKey]);

  // ---- the listing follows the open chat ----
  // Derived titles land after the first turn; previews and spinners change as
  // turns settle. Tell the surface on those transitions only.
  const latestStatus = chat.latestExecution?.status ?? null;
  const chatTitle = chat.chat?.title ?? null;
  const prevListSignalRef = useRef<{ status: string | null; title: string | null }>({
    status: null,
    title: null,
  });
  useEffect(() => {
    const prev = prevListSignalRef.current;
    const changed = prev.status !== latestStatus || prev.title !== chatTitle;
    prevListSignalRef.current = { status: latestStatus, title: chatTitle };
    if (changed) onListStale?.();
  }, [latestStatus, chatTitle, onListStale]);

  // ---- sending ----
  // Async continuations compare against the live session and discard results
  // that raced a switch instead of applying them to the new one.
  const sessionKeyRef = useRef(sessionKey);
  sessionKeyRef.current = sessionKey;
  const isCurrentSession = useCallback((key: string) => sessionKeyRef.current === key, []);

  const getBudgetSnapshot = researchAI.getSnapshot;
  const failureNotice = useCallback(
    (outcome: FailedSend): ComposerNotice | null => {
      const snapshot = getBudgetSnapshot();
      return noticeFromOutcome(
        outcome,
        notices,
        snapshot.budget?.resets_at ?? snapshot.limitResetAt
      );
    },
    [getBudgetSnapshot, notices]
  );

  const composerBusy =
    chat.isBusy ||
    chat.isFinishing ||
    creatingChat ||
    queuedMessage != null ||
    (canSelectModel && modelSelection.status === 'loading');

  const send = useCallback(
    async (rawText: string = draft) => {
      const text = rawText.trim();
      if (!text || sendBlocked || composerBusy) return;
      setNotice(null);
      const session = sessionKeyRef.current;
      // Captured before the awaits: the turn runs on what was selected when the
      // user pressed send, not on whatever the picker says by the time it lands.
      const generation = modelSelection.request;
      // The box empties the moment the user sends, as the message is already
      // theirs; it only comes back if the send fails and they need to retry.
      setDraft('');

      if (chatId == null) {
        const creationSeq = ++creationSeqRef.current;
        setCreatingChat(true);
        let created: AgentChat | null = null;
        let failure: string | null = null;
        try {
          created = await transport.createChat(getCreateInit?.());
        } catch (error) {
          failure = chatErrorDetail(error) ?? null;
        }
        // A newer creation may own the flag by now — a stale settle must not
        // unblock its composer while that creation is still in flight.
        if (creationSeqRef.current === creationSeq) setCreatingChat(false);
        // The listing has a new row, or a refused creation for it to explain.
        onListStale?.();
        // Switched away meanwhile — abandon the creation instead of yanking
        // the selection to a stale chat.
        if (!isCurrentSession(session)) return;
        if (!created) {
          setDraft(text);
          setNotice({
            tone: 'error',
            text: failure ?? `Couldn’t start a ${notices.noun}. Please try again.`,
          });
          return;
        }
        draftsRef.current.delete(session);
        // A rejected first attempt must retry with the same model and settings.
        const createdKey = sessionKeyFor(transport, created.conversation_id);
        modelSelection.adoptConversation(createdKey, generation);
        setCreatedChat(created);
        setQueuedMessage({ sessionKey: createdKey, text, generation });
        onChatCreated(created);
        return;
      }

      const outcome = await chat.send(text, generation);
      if (outcome.ok) {
        // Sent fine after a switch: retire the draft under its own chat.
        if (!isCurrentSession(session)) draftsRef.current.delete(session);
        return;
      }
      if (isCurrentSession(session)) {
        setDraft(text);
        setNotice(failureNotice(outcome));
      } else {
        draftsRef.current.set(session, text);
      }
    },
    [
      draft,
      sendBlocked,
      composerBusy,
      chatId,
      transport,
      chat,
      modelSelection.request,
      modelSelection.adoptConversation,
      setDraft,
      isCurrentSession,
      getCreateInit,
      onListStale,
      onChatCreated,
      notices.noun,
      failureNotice,
    ]
  );

  // Fire the queued first message once the freshly created chat is live and
  // selected. A message queued for another chat waits for that chat.
  const sendToChat = chat.send;
  useEffect(() => {
    if (queuedMessage == null || queuedMessage.sessionKey !== sessionKey) return;
    if (chat.access !== 'ok') return;
    const { text, generation } = queuedMessage;
    setQueuedMessage(null);
    sendToChat(text, generation).then((outcome) => {
      if (outcome.ok) return;
      if (isCurrentSession(queuedMessage.sessionKey)) {
        setNotice(failureNotice(outcome));
        setDraft(text);
      } else {
        // Failed after a switch — keep the unsent text under its own chat.
        draftsRef.current.set(queuedMessage.sessionKey, text);
      }
    });
  }, [
    queuedMessage,
    sessionKey,
    chat.access,
    sendToChat,
    setDraft,
    isCurrentSession,
    failureNotice,
  ]);

  // A queued message whose chat was never selected (the surface moved on
  // before the creation settled) must not fire when that chat is opened later
  // in some other context: it dies with the transport it was queued on.
  useEffect(() => {
    setQueuedMessage((current) =>
      current != null && !current.sessionKey.startsWith(`${transport.key}:`) ? null : current
    );
  }, [transport]);

  // A spent-budget notice raised before the allowance store had a reset time
  // picks it up once the store's post-429 refresh lands.
  const budgetResetsAt = researchAI.budget?.resets_at ?? researchAI.limitResetAt ?? null;
  useEffect(() => {
    if (!budgetResetsAt || notices.usageLimit !== 'inline') return;
    setNotice((current) =>
      isBudgetNoticeWithoutReset(current) ? budgetSpentNotice(budgetResetsAt) : current
    );
  }, [budgetResetsAt, notices.usageLimit]);

  // Stop is only offered once something cancellable exists server-side. While
  // the message POST is still in flight or the chat is being created, cancel
  // would no-op and the turn would start anyway.
  const turnActive =
    chat.latestExecution != null && isActiveExecutionStatus(chat.latestExecution.status);
  const canStop = turnActive || chat.pendingSend?.executionId != null;

  return {
    chat,
    modelSelection,
    researchAI,
    sessionKey,
    draft,
    setDraft,
    notice,
    clearNotice,
    creatingChat,
    sendBlocked,
    composerBusy,
    canStop,
    send,
    stop: chat.cancel,
  };
}
