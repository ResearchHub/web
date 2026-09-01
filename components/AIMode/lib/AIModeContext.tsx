'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createAssistantMessage, createConversation, createUserMessage } from './conversations';
import {
  FREE_INPUT_ENTRY_STAGE,
  TRACK_ENTRY_STAGE,
  TRACK_PROMPTS,
  getStage,
  resolveStage,
  type ScriptContext,
  type ScriptStage,
} from './script';
import type { AIConversation, AIModeTrack, ChatMessage, GuardrailConfig } from './types';

/**
 * Bump on any script change that would leave a persisted conversation
 * mid-flight in a stage that no longer exists — otherwise a browser that ran an
 * earlier version of the demo restores it and the run opens on the wrong topic.
 */
const STORAGE_KEY = 'researchhub:ai-mode:v2';

/** Delay before the first drafted section lands, and the gap between sections. */
const SECTION_REVEAL_DELAY_MS = 500;
const SECTION_REVEAL_GAP_MS = 1100;

interface PersistedState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  aiDelegationEnabled?: boolean;
}

interface SendMessageOptions {
  /** Overrides the current stage's default next stage. */
  goTo?: string;
  /**
   * Conversation fields to commit alongside the turn. Applied here rather than
   * in a separate call so the commitment can't be clobbered by this update.
   */
  patch?: Partial<AIConversation>;
}

interface AIModeContextValue {
  isOpen: boolean;
  conversations: AIConversation[];
  activeConversation: AIConversation | null;
  /** True while an assistant turn is still thinking or streaming. */
  isBusy: boolean;
  /** Demo control: whether the funder is offered the delegation step at all. */
  aiDelegationEnabled: boolean;
  actions: {
    open: () => void;
    close: () => void;
    toggle: () => void;
    newConversation: () => void;
    selectConversation: (conversationId: string) => void;
    startTrack: (track: AIModeTrack) => void;
    sendMessage: (content: string, options?: SendMessageOptions) => void;
    revealNextBlock: (conversationId: string, messageId: string) => void;
    setDocumentOpen: (open: boolean) => void;
    updateGuardrails: (patch: Partial<GuardrailConfig>) => void;
    confirmPayment: (amountUsd: number, methodLabel: string) => void;
    confirmGuardrails: () => void;
    setAiDelegationEnabled: (enabled: boolean) => void;
    resetDemo: () => void;
  };
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

const readPersistedState = (): PersistedState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.conversations)) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const AIModeProvider = ({ children }: { readonly children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // On by default: this run is meant to show delegated disbursement, so the
  // guardrails step should not be something the presenter has to switch on.
  const [aiDelegationEnabled, setAiDelegationEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Scripted turns run on timers; they have to be cancellable so a reset or an
  // unmount can't land a stale assistant turn in a fresh conversation.
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delayMs);
    timersRef.current.add(timer);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const persisted = readPersistedState();
    if (persisted) {
      setConversations(persisted.conversations);
      setActiveConversationId(persisted.activeConversationId);
      setAiDelegationEnabled(persisted.aiDelegationEnabled ?? true);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          conversations,
          activeConversationId,
          aiDelegationEnabled,
        } satisfies PersistedState)
      );
    } catch {
      // A full or unavailable storage quota shouldn't take the demo down.
    }
  }, [conversations, activeConversationId, aiDelegationEnabled, isHydrated]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const isBusy = useMemo(() => {
    const lastMessage = activeConversation?.messages.at(-1);
    return !!lastMessage && lastMessage.role === 'assistant' && lastMessage.status !== 'complete';
  }, [activeConversation]);

  const patchConversation = useCallback(
    (conversationId: string, patch: (conversation: AIConversation) => AIConversation) => {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? patch(conversation) : conversation
        )
      );
    },
    []
  );

  /**
   * Commits an assistant turn for `stage` and runs its thinking, streaming and
   * section-reveal timers. `precedingMessages` is what prompted the turn, which
   * is a single user message for most turns and nothing at all when the script
   * continues under its own steam.
   */
  const scriptContext = useCallback(
    (conversation: AIConversation): ScriptContext => ({
      guardrails: conversation.guardrails,
      aiDelegationEnabled,
    }),
    [aiDelegationEnabled]
  );

  const runStage = useCallback(
    (
      conversation: AIConversation,
      stage: ScriptStage,
      precedingMessages: ChatMessage[],
      isNew: boolean
    ) => {
      const assistantMessage = createAssistantMessage({
        blocks: stage.build(scriptContext(conversation)),
        quickReplies: stage.quickReplies,
        thinkingLabel: stage.thinkingLabel,
      });

      const updated: AIConversation = {
        ...conversation,
        title: stage.title ?? conversation.title,
        subtitle: stage.subtitle,
        stageId: stage.id,
        messages: [...conversation.messages, ...precedingMessages, assistantMessage],
        updatedAt: Date.now(),
      };

      if (isNew) {
        setConversations((previous) => [updated, ...previous]);
        setActiveConversationId(updated.id);
      } else {
        setConversations((previous) => [
          updated,
          ...previous.filter((entry) => entry.id !== updated.id),
        ]);
      }

      // The thinking beat, then text starts revealing.
      schedule(() => {
        patchConversation(updated.id, (current) => ({
          ...current,
          documentOpen: stage.openDocument ? true : current.documentOpen,
          messages: current.messages.map((message) =>
            message.id === assistantMessage.id ? { ...message, status: 'streaming' } : message
          ),
        }));

        stage.revealSections?.forEach((sectionId, index) => {
          schedule(
            () => {
              patchConversation(updated.id, (current) =>
                current.revealedSections.includes(sectionId)
                  ? current
                  : { ...current, revealedSections: [...current.revealedSections, sectionId] }
              );
            },
            SECTION_REVEAL_DELAY_MS + index * SECTION_REVEAL_GAP_MS
          );
        });
      }, stage.thinkingMs);
    },
    [patchConversation, schedule, scriptContext]
  );

  const sendMessage = useCallback(
    (content: string, options: SendMessageOptions = {}) => {
      const trimmed = content.trim();
      if (!trimmed || isBusy) return;

      const base = activeConversation ?? createConversation();
      const isNew = !activeConversation;
      const conversation = options.patch ? { ...base, ...options.patch } : base;

      const currentStage = getStage(conversation.stageId);
      // Opening a conversation by typing or pasting means the funder has already
      // stated the vision, so that first message is read rather than answered
      // with a question. A finished branch falls back to a graceful holding
      // stage rather than leaving the message unanswered.
      const nextStageId =
        options.goTo ??
        (conversation.stageId === null ? FREE_INPUT_ENTRY_STAGE : currentStage?.next) ??
        'generic:idle';

      const stage = resolveStage(nextStageId, scriptContext(conversation));
      if (!stage) return;

      runStage(conversation, stage, [createUserMessage(trimmed)], isNew);
    },
    [activeConversation, isBusy, runStage, scriptContext]
  );

  // Stages that continue on their own do so once their text has finished, so
  // the funder reads each step as it lands instead of clicking through it. The
  // ref makes the hand-off idempotent: re-renders while the timer is pending
  // must not queue the same follow-on turn twice.
  const autoAdvancedRef = useRef<Set<string>>(new Set());
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!activeConversation) return;

    const lastMessage = activeConversation.messages.at(-1);
    if (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.status !== 'complete') {
      return;
    }

    const stage = getStage(activeConversation.stageId);
    if (!stage?.autoAdvanceMs || !stage.next) return;

    const nextStage = resolveStage(stage.next, scriptContext(activeConversation));
    if (!nextStage || autoAdvancedRef.current.has(lastMessage.id)) return;

    autoAdvancedRef.current.add(lastMessage.id);
    schedule(() => {
      const current = conversationsRef.current.find((entry) => entry.id === activeConversation.id);
      // Anything the funder sent during the hand-off wins, and the script picks
      // up from wherever that left him.
      if (!current || current.messages.at(-1)?.id !== lastMessage.id) return;

      runStage(current, nextStage, [], false);
    }, stage.autoAdvanceMs);
  }, [activeConversation, runStage, schedule, scriptContext]);

  const revealNextBlock = useCallback(
    (conversationId: string, messageId: string) => {
      patchConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) => {
          if (message.id !== messageId || message.status !== 'streaming') return message;

          const revealedBlocks = Math.min(message.revealedBlocks + 1, message.blocks.length);
          return {
            ...message,
            revealedBlocks,
            status: revealedBlocks >= message.blocks.length ? 'complete' : 'streaming',
          };
        }),
      }));
    },
    [patchConversation]
  );

  const startTrack = useCallback(
    (track: AIModeTrack) => {
      sendMessage(TRACK_PROMPTS[track], { goTo: TRACK_ENTRY_STAGE[track] });
    },
    [sendMessage]
  );

  const setDocumentOpen = useCallback(
    (open: boolean) => {
      if (!activeConversationId) return;
      patchConversation(activeConversationId, (conversation) => ({
        ...conversation,
        documentOpen: open,
      }));
    },
    [activeConversationId, patchConversation]
  );

  const updateGuardrails = useCallback(
    (patch: Partial<GuardrailConfig>) => {
      if (!activeConversationId) return;
      patchConversation(activeConversationId, (conversation) => ({
        ...conversation,
        guardrails: { ...conversation.guardrails, ...patch },
      }));
    },
    [activeConversationId, patchConversation]
  );

  // Both confirmations record the commitment as part of the turn, so the block
  // renders in its locked state rather than re-offering the action.
  const confirmPayment = useCallback(
    (amountUsd: number, methodLabel: string) => {
      sendMessage(`Confirm payment via ${methodLabel}`, {
        patch: { fundedAmountUsd: amountUsd },
      });
    },
    [sendMessage]
  );

  const confirmGuardrails = useCallback(() => {
    sendMessage('Confirm spending policy', { patch: { guardrailsConfirmed: true } });
  }, [sendMessage]);

  // A blank slate, not a re-seed: every conversation from the previous run goes,
  // so the next demo opens exactly as the first one did. Cancelling in-flight
  // timers first stops a half-streamed turn from landing after the wipe. The
  // persistence effect rewrites storage from here.
  const resetDemo = useCallback(() => {
    clearTimers();
    autoAdvancedRef.current.clear();
    setConversations([]);
    setActiveConversationId(null);
  }, [clearTimers]);

  const value = useMemo<AIModeContextValue>(
    () => ({
      isOpen,
      conversations,
      activeConversation,
      isBusy,
      aiDelegationEnabled,
      actions: {
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((previous) => !previous),
        newConversation: () => setActiveConversationId(null),
        selectConversation: setActiveConversationId,
        startTrack,
        sendMessage,
        revealNextBlock,
        setDocumentOpen,
        updateGuardrails,
        confirmPayment,
        confirmGuardrails,
        setAiDelegationEnabled,
        resetDemo,
      },
    }),
    [
      isOpen,
      conversations,
      activeConversation,
      isBusy,
      aiDelegationEnabled,
      startTrack,
      sendMessage,
      revealNextBlock,
      setDocumentOpen,
      updateGuardrails,
      confirmPayment,
      confirmGuardrails,
      resetDemo,
    ]
  );

  return <AIModeContext.Provider value={value}>{children}</AIModeContext.Provider>;
};

export const useAIMode = () => {
  const context = useContext(AIModeContext);
  if (!context) {
    throw new Error('useAIMode must be used within an AIModeProvider');
  }
  return context;
};
