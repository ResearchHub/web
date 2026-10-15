'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FileText, History, Sparkles } from 'lucide-react';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import { ChatPicker } from '@/components/AgentChat/ChatPicker';
import { ChatTranscript } from '@/components/AgentChat/ChatTranscript';
import { JumpToLatestButton } from '@/components/AgentChat/JumpToLatestButton';
import { ModelControls } from '@/components/AgentChat/ModelControls';
import { RefusalActions } from '@/components/AgentChat/RefusalActions';
import { useJumpToLatest } from '@/hooks/useJumpToLatest';
import { Button } from '@/components/ui/Button';
import { ChatTranscriptSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { canSelectAIModel } from '@/types/researchAI';
import type { ChatExecution } from '@/types/agentChat';
import { cn } from '@/utils/styles';
import type { AIModeChatState } from '../useAIModeChat';
import { AI_MODE_GREETING } from '../copy';
import { StartContextChips } from '../start/StartContextChips';
import {
  START_COMPOSER_MIN_ROWS,
  startComposerBoxClass,
  startComposerPlaceholder,
  startComposerSendClass,
} from '../start/startComposer';
import { StartPresets } from '../start/StartPresets';
import { StartScreen } from '../start/StartScreen';
import { ChatMenu } from './ChatMenu';
import { ChatTitleField } from './ChatTitleField';

interface ChatPaneProps {
  readonly state: AIModeChatState;
  /** The open document no longer exists. */
  readonly documentMissing: boolean;
  /**
   * The chat stays on its skeleton even once it has loaded: the document
   * beside it is still coming, and the two show together.
   */
  readonly held?: boolean;
  /** Under a turn, after its answer: the document's card, under the newest turn that wrote to it. */
  readonly renderExecutionExtra?: (execution: ChatExecution) => ReactNode;
}

/** What the chat pane's body shows. */
export type ChatPaneContent =
  /** The assistant is closed to this account, or this chat is someone else's. */
  | 'blocked'
  /** The screen that starts a new draft. */
  | 'start'
  /** The document no longer exists. */
  | 'missing'
  /** The document's chats are closed to this account. */
  | 'list-blocked'
  | 'list-failed'
  | 'chat-failed'
  /** The document's most recent chat is being found, or the open one is loading. */
  | 'loading'
  /** A new chat, or one with nothing in it yet. */
  | 'empty'
  | 'transcript';

/** What the chat pane's body shows, for `state`; the page asks too, to know when it has loaded. */
export function chatPaneContent(state: AIModeChatState, documentMissing: boolean): ChatPaneContent {
  if (state.researchAI.budget?.tier === 'blocked') return 'blocked';
  if (state.target.kind === 'new') return 'start';
  if (documentMissing) return 'missing';
  const listAccess = state.listReady ? state.list.access : 'loading';
  if (listAccess === 'hidden') return 'list-blocked';
  // Never the new-chat state while the most recent chat is being found: it
  // would read as the chat having gone.
  if (state.resolvingChat) return listAccess === 'error' ? 'list-failed' : 'loading';
  if (state.chatId == null) return 'empty';
  return openChatContent(state.chat);
}

/** What the chat pane's body shows of the open chat. */
function openChatContent(chat: AIModeChatState['chat']): ChatPaneContent {
  if (chat.access === 'unauthorized') return 'blocked';
  // A chat that is gone hands over to the document's most recent one.
  if (chat.chat == null) return chat.access === 'error' ? 'chat-failed' : 'loading';
  const isEmpty =
    chat.chat.messages.length === 0 && chat.chat.executions.length === 0 && !chat.pendingSend;
  return isEmpty ? 'empty' : 'transcript';
}

/**
 * The chat: on a document, its header (the chat's menu and History), the
 * transcript and the composer; on the screen that starts a new draft, the
 * composer in the middle of the page, and at its foot a way to write the
 * draft without the assistant.
 */
export function ChatPane({
  state,
  documentMissing,
  held = false,
  renderExecutionExtra,
}: ChatPaneProps) {
  const {
    chatId,
    list,
    listReady,
    chat,
    modelSelection,
    draft,
    setDraft,
    notice,
    composerBusy,
    canStop,
  } = state;
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const onStart = state.target.kind === 'new';
  const resolving = state.resolvingChat;

  // ---- transcript auto-scroll ----
  // Follows new content while the reader is at the bottom; never yanks the
  // view down once they have scrolled up, and offers a jump back instead.
  // The start screen has no transcript to follow: on a phone it is taller
  // than the viewport, and following would scroll the greeting away.
  const { scrollRef, handleScroll, isAtBottom, jumpToLatest, follow } =
    useJumpToLatest<HTMLDivElement>({ resetKey: chatId });
  useEffect(() => {
    if (!onStart) follow();
  }, [chat.chat, chat.pendingSend, follow, onStart]);
  // Text types out over many frames without the chat changing, so follow the
  // content's own growth too.
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (onStart || !el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => follow());
    observer.observe(el);
    return () => observer.disconnect();
  }, [follow, chatId, onStart]);

  // ---- title: inline rename from the header menu ----
  const [renaming, setRenaming] = useState(false);
  useEffect(() => {
    setRenaming(false);
  }, [chatId]);

  // The start screen is there to be typed into: the caret is in the box the
  // moment it opens, whichever door it opened from.
  useEffect(() => {
    if (onStart) composerRef.current?.focus();
  }, [onStart]);

  /**
   * Loads the composer rather than sending: a suggestion is a starting point
   * the user finishes, a refused message one they reword. Focus follows the
   * text so the caret is already waiting at the end of it.
   */
  const { clearNotice } = state;
  const applyPreset = useCallback(
    (message: string) => {
      clearNotice();
      setDraft(message);
      const textarea = composerRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(message.length, message.length);
    },
    [clearNotice, setDraft]
  );

  // A refusal is about what was asked, so the same message would be refused
  // again: the newest turn's offers a way to reword it, or a new chat.
  const { openChat } = state;
  const renderFailureActions = (execution: ChatExecution) => {
    if (execution.error?.code !== 'content_refused') return null;
    if (execution.id !== chat.latestExecution?.id) return null;
    const refused = chat.chat?.messages.find(
      (message) => message.id === execution.trigger_message_id
    )?.content;
    return (
      <RefusalActions
        onEditMessage={refused ? () => applyPreset(refused) : undefined}
        onNewChat={() => openChat('new')}
      />
    );
  };

  const aiBlocked = state.researchAI.budget?.tier === 'blocked';
  const canSelectModel = canSelectAIModel(state.researchAI.budget?.tier);
  const listBlocked = listReady && list.access === 'hidden';
  const listFailed = listReady && list.access === 'error';
  const chatUnavailable =
    chatId != null && (chat.access === 'not_found' || chat.access === 'unauthorized');
  const composerDisabled =
    aiBlocked ||
    documentMissing ||
    listBlocked ||
    resolving ||
    chatUnavailable ||
    (chatId != null && chat.access === 'loading');

  const title = chatId == null ? 'New chat' : state.chatTitle?.trim() || 'Untitled chat';

  const modelControls = (
    <ModelControls
      models={modelSelection.models}
      model={modelSelection.model}
      pinned={modelSelection.pinned}
      effortPinned={modelSelection.effortPinned}
      options={modelSelection.options}
      onSelectModel={modelSelection.selectModel}
      onChangeOptions={modelSelection.setOptions}
      disabled={composerDisabled}
      multiplierExplanation={modelSelection.multiplierExplanation}
      showIcons={false}
    />
  );

  const composer = (
    <ChatComposer
      textareaRef={composerRef}
      value={draft}
      onChange={setDraft}
      // Not the handler itself: the button would hand it its click event as the text.
      onSend={() => void state.send()}
      onStop={state.stop}
      busy={composerBusy}
      canStop={canStop}
      disabled={composerDisabled}
      sendDisabled={state.sendBlocked}
      notice={notice}
      // Files upload as they are picked, which needs an account.
      attachments={state.signedOut ? undefined : state.attachments}
      dropTargetRef={paneRef}
      className={cn('border-t-0', onStart ? 'bg-white pt-0' : 'bg-gray-50')}
      boxClassName={onStart ? startComposerBoxClass(state.intent) : undefined}
      minRows={onStart ? START_COMPOSER_MIN_ROWS : 1}
      sendClassName={onStart ? startComposerSendClass(state.intent) : undefined}
      placeholder={onStart ? startComposerPlaceholder(state.intent) : undefined}
      toolbar={
        // A researcher's context rides with the first message, like attachments.
        onStart && state.intent === 'need_funding' ? (
          <StartContextChips
            selectedGrant={state.selectedGrant}
            onSelectGrant={state.setSelectedGrant}
          />
        ) : undefined
      }
      // The model and effort sit under the box, at its right, out of the message's
      // way, for those who may choose them; everyone else gets the API's default.
      footer={
        canSelectModel ? (
          <div className="mt-1.5 flex justify-end pr-0.5">{modelControls}</div>
        ) : undefined
      }
    />
  );

  const content = chatPaneContent(state, documentMissing);
  const body = (): ReactNode => {
    switch (content) {
      case 'blocked':
        return <AccessBlocked detail={null} />;
      case 'start':
        return (
          <StartScreen
            composer={composer}
            greeting={AI_MODE_GREETING}
            intent={state.intent}
            presets={
              // A funder sees what to ask for; a researcher brings their own topic.
              state.intent === 'fund' ? (
                <StartPresets
                  onSelect={(message) => void state.send(message)}
                  disabled={composerDisabled || composerBusy || state.sendBlocked}
                />
              ) : undefined
            }
          />
        );
      case 'missing':
        return (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-gray-600">This document is no longer available.</p>
            <Link
              href="/my-funding"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Go to My Funding
            </Link>
          </div>
        );
      case 'list-blocked':
        return <AccessBlocked detail={list.accessDetail} />;
      case 'list-failed':
        return <RetryState message="Couldn’t load this document’s chats." onRetry={list.refresh} />;
      case 'chat-failed':
        return <RetryState message="Couldn’t load this chat." onRetry={chat.refetch} />;
      case 'loading':
        return <ChatTranscriptSkeleton />;
    }
    if (held) return <ChatTranscriptSkeleton />;
    if (content === 'empty' || chat.chat == null) {
      // A new chat says what the assistant can do in a line and leaves the
      // rest to the composer: no heading, no suggestions to pick from.
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6">
          <Sparkles className="h-8 w-8 text-primary-500" aria-hidden="true" />
          <p className="max-w-xs text-center text-sm leading-relaxed text-gray-500">
            The assistant can help draft this document, find research to support it, and answer your
            questions along the way.
          </p>
        </div>
      );
    }
    return (
      <ChatTranscript
        chat={chat.chat}
        pendingSend={chat.pendingSend}
        renderExecutionExtra={renderExecutionExtra}
        renderFailureActions={renderFailureActions}
      />
    );
  };

  return (
    <div ref={paneRef} className={cn('flex h-full min-h-0 flex-col', onStart && 'bg-white')}>
      {/* No border or fill: the controls float over the pane, at its right.
          No title: the top bar already names the document, and History
          names the chats. The start screen has no chat yet, so no header. */}
      {!onStart && !documentMissing && (
        <header className="flex h-12 shrink-0 items-center gap-1 pl-5 pr-2">
          {renaming && chatId != null ? (
            <ChatTitleField
              initialValue={state.chatTitle ?? ''}
              className="max-w-md flex-1"
              onCancel={() => setRenaming(false)}
              onCommit={(value) => {
                setRenaming(false);
                const next = value.trim();
                if (next && next !== (state.chatTitle ?? '')) void state.rename(next);
              }}
            />
          ) : (
            <div className="flex-1" />
          )}

          {/* This chat's menu, then History of the document's chats. */}
          {chatId != null && !renaming && (
            <ChatMenu
              title={title}
              onRename={() => setRenaming(true)}
              onDelete={() => void state.deleteChat(chatId)}
            />
          )}
          {!listBlocked && (
            <ChatPicker
              chats={listReady ? list.chats : []}
              activeChatId={chatId}
              activeTitle={state.chatTitle}
              onSelect={(id) => state.openChat(id)}
              onOpen={() => void list.refresh()}
              onNewChat={() => state.openChat('new')}
              failed={listFailed}
              className="flex-none"
              trigger={
                <button
                  type="button"
                  aria-label="Chat history"
                  title="Chat history"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900"
                >
                  <History className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              }
            />
          )}
        </header>
      )}

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
          <div ref={contentRef} className="mx-auto w-full max-w-[760px] px-4 py-5 tablet:!px-6">
            {body()}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <JumpToLatestButton
            visible={!isAtBottom}
            onClick={jumpToLatest}
            className="pointer-events-auto"
          />
        </div>
      </div>

      {/* A document's chat keeps the composer docked at the bottom; the start
          screen seats it in the middle. */}
      {!onStart && !documentMissing && (
        <div className="shrink-0 border-t border-gray-200 bg-gray-50">
          <div className="mx-auto w-full max-w-[760px] px-3 py-3 tablet:!px-5">{composer}</div>
        </div>
      )}

      {/* Quiet, at the foot of the page: the assistant is the way in, but
          not the only one. Also there for those the assistant is closed to. */}
      {onStart && (
        <p className="flex shrink-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-4 pb-6 pt-2 text-sm text-gray-600">
          Prefer to write without the assistant?
          <button
            type="button"
            onClick={() => void state.startBlank()}
            disabled={!state.canStartBlank}
            className="inline-flex items-center gap-1.5 font-medium text-gray-900 transition-colors hover:text-primary-700 disabled:cursor-wait disabled:opacity-60"
          >
            <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <span className="underline decoration-gray-400 underline-offset-[3px]">
              {state.startingBlank ? 'Starting a blank page…' : 'Start with a blank page'}
            </span>
          </button>
        </p>
      )}
    </div>
  );
}

function RetryState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      <Button variant="outlined" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function AccessBlocked({ detail }: { readonly detail: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-sm font-medium text-gray-800">The assistant isn’t available to you yet.</p>
      <p className="max-w-sm text-sm text-gray-600">
        {detail ?? 'Your account doesn’t have access to this feature.'}
      </p>
    </div>
  );
}
