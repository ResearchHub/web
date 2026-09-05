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
import { DEFAULT_JUDGMENT, createGrant, createPublishedGrant } from './grants';
import {
  FREE_INPUT_ENTRY_STAGE,
  TRACK_ENTRY_STAGE,
  TRACK_PROMPTS,
  getStage,
  resolveStage,
  type ScriptContext,
  type ScriptStage,
} from './script';
import type {
  AIConversation,
  AIModeTrack,
  Attachment,
  ChatMessage,
  DocumentTab,
  GrantRecord,
  JudgmentPolicy,
  MessageFeedback,
} from './types';

/**
 * Bump on any script or shape change that would leave a persisted conversation
 * in a state this build can't read — otherwise a browser that ran an earlier
 * version of the demo restores it and the run opens on the wrong topic.
 */
const STORAGE_KEY = 'researchhub:ai-mode:v3';

/** Delay before the first drafted section lands, and the gap between sections. */
const SECTION_REVEAL_DELAY_MS = 500;
const SECTION_REVEAL_GAP_MS = 1100;

interface PersistedState {
  conversations: AIConversation[];
  grants: GrantRecord[];
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
  /** Same, for the conversation's grant. */
  grantPatch?: (grant: GrantRecord) => Partial<GrantRecord>;
  attachments?: Attachment[];
}

/** A citation the panel should scroll to. `key` changes on every request. */
export interface DocumentHighlight {
  tab: DocumentTab;
  sectionId: string | null;
  key: number;
}

interface AIModeContextValue {
  isOpen: boolean;
  conversations: AIConversation[];
  grants: GrantRecord[];
  activeConversation: AIConversation | null;
  /** The program the active conversation is about, if it has reached one. */
  activeGrant: GrantRecord | null;
  /** True while an assistant turn is still thinking or streaming. */
  isBusy: boolean;
  /** Demo control: whether the funder is offered the delegation step at all. */
  aiDelegationEnabled: boolean;
  highlight: DocumentHighlight | null;
  /** Text waiting in the composer, set when a user turn is edited. */
  composerDraft: string | null;
  actions: {
    open: () => void;
    close: () => void;
    toggle: () => void;
    newConversation: () => void;
    selectConversation: (conversationId: string) => void;
    startTrack: (track: AIModeTrack) => void;
    sendMessage: (content: string, options?: SendMessageOptions) => void;
    revealNextBlock: (conversationId: string, messageId: string) => void;
    /** Finishes the in-flight turn immediately. */
    stopGeneration: () => void;
    /** Re-runs the stage behind the latest assistant turn. */
    regenerate: () => void;
    /** Rewinds to before a user turn and loads its text into the composer. */
    editMessage: (messageId: string) => void;
    clearComposerDraft: () => void;
    setFeedback: (messageId: string, feedback: MessageFeedback | null) => void;
    setPanel: (open: boolean, tab?: DocumentTab) => void;
    /** Opens the panel on a document, scrolled to a section when given. */
    openDocument: (tab: DocumentTab, sectionId?: string | null) => void;
    updateJudgment: (patch: Partial<JudgmentPolicy>) => void;
    confirmJudgment: () => void;
    confirmPayment: (amountUsd: number, methodLabel: string) => void;
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
    if (!Array.isArray(parsed.conversations) || !Array.isArray(parsed.grants)) return null;

    return parsed;
  } catch {
    return null;
  }
};

/** Whether a stage needs a grant to exist before it plays. */
const stageNeedsGrant = (stage: ScriptStage) =>
  !!stage.openPanel || !!stage.revealSections || !!stage.grantPatch;

export const AIModeProvider = ({ children }: { readonly children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // On by default: this run is meant to show delegated disbursement, so the
  // judgment step should not be something the presenter has to switch on.
  const [aiDelegationEnabled, setAiDelegationEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [highlight, setHighlight] = useState<DocumentHighlight | null>(null);
  const [composerDraft, setComposerDraft] = useState<string | null>(null);

  // Scripted turns run on timers; they have to be cancellable so a reset, a
  // stop or an unmount can't land a stale assistant turn in a fresh thread.
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
      setGrants(persisted.grants);
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
          grants,
          activeConversationId,
          aiDelegationEnabled,
        } satisfies PersistedState)
      );
    } catch {
      // A full or unavailable storage quota shouldn't take the demo down.
    }
  }, [conversations, grants, activeConversationId, aiDelegationEnabled, isHydrated]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const activeGrant = useMemo(
    () => grants.find((grant) => grant.id === activeConversation?.grantId) ?? null,
    [grants, activeConversation?.grantId]
  );

  const isBusy = useMemo(() => {
    const lastMessage = activeConversation?.messages.at(-1);
    return !!lastMessage && lastMessage.role === 'assistant' && lastMessage.status !== 'complete';
  }, [activeConversation]);

  // Refs let timer callbacks and synchronous action chains read the latest
  // state without being re-created on every change.
  const conversationsRef = useRef(conversations);
  const grantsRef = useRef(grants);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    grantsRef.current = grants;
  }, [grants]);

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

  const patchGrant = useCallback(
    (grantId: string, patch: (grant: GrantRecord) => Partial<GrantRecord>) => {
      setGrants((previous) =>
        previous.map((grant) =>
          grant.id === grantId ? { ...grant, ...patch(grant), updatedAt: Date.now() } : grant
        )
      );
    },
    []
  );

  const scriptContext = useCallback(
    (grantId: string | null, freshGrant?: GrantRecord): ScriptContext => {
      const grant = freshGrant ?? grantsRef.current.find((entry) => entry.id === grantId);
      return {
        policy: grant?.judgment.policy ?? DEFAULT_JUDGMENT,
        aiDelegationEnabled,
      };
    },
    [aiDelegationEnabled]
  );

  /**
   * Commits an assistant turn for `stage` and runs its thinking, streaming and
   * section-reveal timers. `precedingMessages` is what prompted the turn, which
   * is a single user message for most turns and nothing at all when the script
   * continues under its own steam.
   */
  const runStage = useCallback(
    (
      conversation: AIConversation,
      stage: ScriptStage,
      precedingMessages: ChatMessage[],
      isNew: boolean
    ) => {
      // A stage that touches a document needs a program to hang it on. Creating
      // it here rather than at conversation start keeps the sidebar honest: a
      // thread that never got past hello has no grant.
      let grantId = conversation.grantId;
      let freshGrant: GrantRecord | undefined;
      if (!grantId && stageNeedsGrant(stage)) {
        freshGrant = createGrant();
        grantId = freshGrant.id;
        setGrants((previous) => [freshGrant as GrantRecord, ...previous]);
      }

      const assistantMessage = createAssistantMessage({
        blocks: stage.build(scriptContext(grantId, freshGrant)),
        quickReplies: stage.quickReplies,
        thinkingLabel: stage.thinkingLabel,
        activity: stage.activity,
        stageId: stage.id,
      });

      const updated: AIConversation = {
        ...conversation,
        title: stage.title ?? conversation.title,
        subtitle: stage.subtitle,
        stageId: stage.id,
        grantId,
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

      // The thinking beat, then text starts revealing and the documents move.
      schedule(() => {
        patchConversation(updated.id, (current) => ({
          ...current,
          panel: stage.openPanel ? { open: true, tab: stage.openPanel } : current.panel,
          messages: current.messages.map((message) =>
            message.id === assistantMessage.id ? { ...message, status: 'streaming' } : message
          ),
        }));

        if (grantId && stage.grantPatch) {
          patchGrant(grantId, stage.grantPatch);
        }

        stage.revealSections?.forEach((sectionId, index) => {
          schedule(
            () => {
              if (!grantId) return;
              patchGrant(grantId, (grant) =>
                grant.rfp.revealedSections.includes(sectionId)
                  ? {}
                  : {
                      rfp: {
                        ...grant.rfp,
                        revealedSections: [...grant.rfp.revealedSections, sectionId],
                      },
                    }
              );
            },
            SECTION_REVEAL_DELAY_MS + index * SECTION_REVEAL_GAP_MS
          );
        });
      }, stage.thinkingMs);
    },
    [patchConversation, patchGrant, schedule, scriptContext]
  );

  const sendMessage = useCallback(
    (content: string, options: SendMessageOptions = {}) => {
      const trimmed = content.trim();
      const attachments = options.attachments ?? [];
      if ((!trimmed && attachments.length === 0) || isBusy) return;

      const base = activeConversation ?? createConversation();
      const isNew = !activeConversation;
      const conversation = options.patch ? { ...base, ...options.patch } : base;

      if (conversation.grantId && options.grantPatch) {
        patchGrant(conversation.grantId, options.grantPatch);
      }

      const currentStage = getStage(conversation.stageId);
      // Opening a conversation by typing or pasting means the funder has already
      // stated the vision, so that first message is read rather than answered
      // with a question. A finished branch falls back to a graceful holding
      // stage rather than leaving the message unanswered.
      const nextStageId =
        options.goTo ??
        (conversation.stageId === null ? FREE_INPUT_ENTRY_STAGE : currentStage?.next) ??
        'generic:idle';

      // A grant patched a moment ago is not yet in the ref, so the resolved
      // policy is read through the patch here.
      const grant = grantsRef.current.find((entry) => entry.id === conversation.grantId);
      const patchedGrant =
        grant && options.grantPatch ? { ...grant, ...options.grantPatch(grant) } : undefined;
      const stage = resolveStage(nextStageId, scriptContext(conversation.grantId, patchedGrant));
      if (!stage) return;

      setComposerDraft(null);
      runStage(
        conversation,
        stage,
        [createUserMessage(trimmed || attachmentSummary(attachments), attachments)],
        isNew
      );
    },
    [activeConversation, isBusy, patchGrant, runStage, scriptContext]
  );

  // Stages that continue on their own do so once their text has finished, so
  // the funder reads each step as it lands instead of clicking through it. The
  // ref makes the hand-off idempotent: re-renders while the timer is pending
  // must not queue the same follow-on turn twice.
  const autoAdvancedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeConversation) return;

    const lastMessage = activeConversation.messages.at(-1);
    if (!lastMessage || lastMessage.role !== 'assistant' || lastMessage.status !== 'complete') {
      return;
    }

    const stage = getStage(activeConversation.stageId);
    if (!stage?.autoAdvanceMs || !stage.next) return;

    const nextStage = resolveStage(stage.next, scriptContext(activeConversation.grantId));
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

  // Lands the whole turn at once: every block, every drafted section, the
  // panel the stage would have opened. Pending timers go first so the thinking
  // beat can't flip the finished message back to streaming.
  const stopGeneration = useCallback(() => {
    const conversation = activeConversation;
    const lastMessage = conversation?.messages.at(-1);
    if (!conversation || !lastMessage || lastMessage.role !== 'assistant') return;
    if (lastMessage.status === 'complete') return;

    clearTimers();

    const stage = getStage(lastMessage.stageId ?? conversation.stageId);

    patchConversation(conversation.id, (current) => ({
      ...current,
      panel: stage?.openPanel ? { open: true, tab: stage.openPanel } : current.panel,
      messages: current.messages.map((message) =>
        message.id === lastMessage.id
          ? { ...message, status: 'complete', revealedBlocks: message.blocks.length }
          : message
      ),
    }));

    if (conversation.grantId && stage) {
      const grantId = conversation.grantId;
      if (stage.grantPatch) patchGrant(grantId, stage.grantPatch);
      if (stage.revealSections) {
        const sections = stage.revealSections;
        patchGrant(grantId, (grant) => ({
          rfp: {
            ...grant.rfp,
            revealedSections: [
              ...grant.rfp.revealedSections,
              ...sections.filter((id) => !grant.rfp.revealedSections.includes(id)),
            ],
          },
        }));
      }
    }
  }, [activeConversation, clearTimers, patchConversation, patchGrant]);

  const regenerate = useCallback(() => {
    const conversation = activeConversation;
    const lastMessage = conversation?.messages.at(-1);
    if (!conversation || isBusy || !lastMessage || lastMessage.role !== 'assistant') return;

    const stage = getStage(lastMessage.stageId ?? conversation.stageId);
    if (!stage) return;

    runStage({ ...conversation, messages: conversation.messages.slice(0, -1) }, stage, [], false);
  }, [activeConversation, isBusy, runStage]);

  const editMessage = useCallback(
    (messageId: string) => {
      const conversation = activeConversation;
      if (!conversation) return;

      const index = conversation.messages.findIndex((message) => message.id === messageId);
      const target = conversation.messages[index];
      if (!target || target.role !== 'user') return;

      clearTimers();

      const remaining = conversation.messages.slice(0, index);
      const lastAssistant = [...remaining]
        .reverse()
        .find((message) => message.role === 'assistant');
      const draft = target.blocks
        .filter((block) => block.kind === 'text')
        .map((block) => (block.kind === 'text' ? block.content : ''))
        .join('\n');

      patchConversation(conversation.id, (current) => ({
        ...current,
        messages: remaining,
        stageId: lastAssistant?.stageId ?? null,
        updatedAt: Date.now(),
      }));
      setComposerDraft(draft);
    },
    [activeConversation, clearTimers, patchConversation]
  );

  const setFeedback = useCallback(
    (messageId: string, feedback: MessageFeedback | null) => {
      if (!activeConversationId) return;
      patchConversation(activeConversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === messageId ? { ...message, feedback: feedback ?? undefined } : message
        ),
      }));
    },
    [activeConversationId, patchConversation]
  );

  const startTrack = useCallback(
    (track: AIModeTrack) => {
      if (track === 'updates') {
        // Updates report on a program that has already been published. Reuse
        // the one the RFP track produced, or seed one so the thread has an RFP
        // and a confirmed policy to show rather than an empty tab.
        const published = grantsRef.current.find((grant) => grant.rfp.status === 'published');
        let grantId = published?.id ?? null;
        if (!grantId) {
          const seeded = createPublishedGrant();
          grantId = seeded.id;
          setGrants((previous) => [seeded, ...previous]);
          grantsRef.current = [seeded, ...grantsRef.current];
        }
        sendMessage(TRACK_PROMPTS[track], {
          goTo: TRACK_ENTRY_STAGE[track],
          patch: { grantId, track },
        });
        return;
      }

      sendMessage(TRACK_PROMPTS[track], { goTo: TRACK_ENTRY_STAGE[track], patch: { track } });
    },
    [sendMessage]
  );

  const setPanel = useCallback(
    (open: boolean, tab?: DocumentTab) => {
      if (!activeConversationId) return;
      patchConversation(activeConversationId, (conversation) => ({
        ...conversation,
        panel: { open, tab: tab ?? conversation.panel.tab },
      }));
    },
    [activeConversationId, patchConversation]
  );

  const openDocument = useCallback(
    (tab: DocumentTab, sectionId: string | null = null) => {
      setPanel(true, tab);
      setHighlight({ tab, sectionId, key: Date.now() });
    },
    [setPanel]
  );

  const updateJudgment = useCallback(
    (patch: Partial<JudgmentPolicy>) => {
      const grantId = activeConversation?.grantId;
      if (!grantId) return;
      patchGrant(grantId, (grant) => ({
        judgment: { ...grant.judgment, policy: { ...grant.judgment.policy, ...patch } },
      }));
    },
    [activeConversation?.grantId, patchGrant]
  );

  // Both confirmations record the commitment as part of the turn, so the
  // widget renders in its locked state rather than re-offering the action.
  const confirmPayment = useCallback(
    (amountUsd: number, methodLabel: string) => {
      sendMessage(`Confirm payment via ${methodLabel}`, {
        grantPatch: () => ({ fundedAmountUsd: amountUsd }),
      });
    },
    [sendMessage]
  );

  const confirmJudgment = useCallback(() => {
    sendMessage('Confirm judgment rules', {
      grantPatch: (grant) => ({ judgment: { ...grant.judgment, confirmed: true } }),
    });
  }, [sendMessage]);

  // A blank slate, not a re-seed: every conversation and program from the
  // previous run goes, so the next demo opens exactly as the first one did.
  // Cancelling in-flight timers first stops a half-streamed turn from landing
  // after the wipe. The persistence effect rewrites storage from here.
  const resetDemo = useCallback(() => {
    clearTimers();
    autoAdvancedRef.current.clear();
    setConversations([]);
    setGrants([]);
    setActiveConversationId(null);
    setHighlight(null);
    setComposerDraft(null);
  }, [clearTimers]);

  const value = useMemo<AIModeContextValue>(
    () => ({
      isOpen,
      conversations,
      grants,
      activeConversation,
      activeGrant,
      isBusy,
      aiDelegationEnabled,
      highlight,
      composerDraft,
      actions: {
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((previous) => !previous),
        newConversation: () => {
          setActiveConversationId(null);
          setComposerDraft(null);
        },
        selectConversation: (conversationId: string) => {
          setActiveConversationId(conversationId);
          setComposerDraft(null);
        },
        startTrack,
        sendMessage,
        revealNextBlock,
        stopGeneration,
        regenerate,
        editMessage,
        clearComposerDraft: () => setComposerDraft(null),
        setFeedback,
        setPanel,
        openDocument,
        updateJudgment,
        confirmJudgment,
        confirmPayment,
        setAiDelegationEnabled,
        resetDemo,
      },
    }),
    [
      isOpen,
      conversations,
      grants,
      activeConversation,
      activeGrant,
      isBusy,
      aiDelegationEnabled,
      highlight,
      composerDraft,
      startTrack,
      sendMessage,
      revealNextBlock,
      stopGeneration,
      regenerate,
      editMessage,
      setFeedback,
      setPanel,
      openDocument,
      updateJudgment,
      confirmJudgment,
      confirmPayment,
      resetDemo,
    ]
  );

  return <AIModeContext.Provider value={value}>{children}</AIModeContext.Provider>;
};

/** What a message with attachments and no text says in the transcript. */
const attachmentSummary = (attachments: Attachment[]) =>
  attachments.length === 1
    ? `Read this: ${attachments[0].name}`
    : `Read these: ${attachments.map((attachment) => attachment.name).join(', ')}`;

export const useAIMode = () => {
  const context = useContext(AIModeContext);
  if (!context) {
    throw new Error('useAIMode must be used within an AIModeProvider');
  }
  return context;
};
