'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import { ChatEmptyState } from '@/components/AgentChat/ChatEmptyState';
import { ChatPicker } from '@/components/AgentChat/ChatPicker';
import { ChatTranscript } from '@/components/AgentChat/ChatTranscript';
import { JumpToLatestButton } from '@/components/AgentChat/JumpToLatestButton';
import { ModelControls } from '@/components/AgentChat/ModelControls';
import { useJumpToLatest } from '@/hooks/useJumpToLatest';
import { Button } from '@/components/ui/Button';
import { ChatTranscriptSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { canSelectAIModel } from '@/types/researchAI';
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
  /** Header controls at its right end: the document toggle. */
  readonly headerActions?: ReactNode;
  /** What the open document is, for a new chat's suggestions. */
  readonly documentIsRfp: boolean;
  /** Nothing is written in the open document yet, for a new chat's suggestions. */
  readonly documentIsEmpty: boolean;
  /** The open document no longer exists. */
  readonly documentMissing: boolean;
}

/**
 * The chat: on a document, its header (the chat's title, History, its menu
 * and the document toggle), the transcript and the composer; on the screen
 * that starts a new draft, the composer in the middle of the page.
 */
export function ChatPane({
  state,
  headerActions,
  documentIsRfp,
  documentIsEmpty,
  documentMissing,
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
   * A suggestion loads the composer rather than sending: its message is a
   * starting point the user finishes. Focus follows the text so the caret is
   * already waiting at the end of it.
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
  const titleLoading =
    resolving || (chatId != null && state.chatTitle == null && chat.chat == null);

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
      attachments={state.attachments}
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

  const body = (): ReactNode => {
    if (aiBlocked) return <AccessBlocked detail={null} />;
    if (onStart) {
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
    }
    if (documentMissing) {
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
    }
    if (listBlocked) return <AccessBlocked detail={list.accessDetail} />;
    if (resolving) {
      // Never the new-chat state while the most recent chat is being found:
      // it would read as the chat having gone.
      return listFailed ? (
        <RetryState message="Couldn’t load this document’s chats." onRetry={list.refresh} />
      ) : (
        <ChatTranscriptSkeleton />
      );
    }
    const emptyState = (
      <div className="flex min-h-[50vh] flex-col justify-center">
        <ChatEmptyState
          noteIsEmpty={documentIsEmpty}
          noteIsRfp={documentIsRfp}
          onSelectPreset={applyPreset}
          presetsDisabled={composerDisabled}
          noun="document"
        />
      </div>
    );
    if (chatId == null) return emptyState;
    switch (chat.access) {
      case 'unauthorized':
        return <AccessBlocked detail={null} />;
      case 'error':
        if (chat.chat == null) {
          return <RetryState message="Couldn’t load this chat." onRetry={chat.refetch} />;
        }
        break;
      case 'loading':
      case 'not_found':
        // A chat that is gone hands over to the document's most recent one.
        if (chat.chat == null) return <ChatTranscriptSkeleton />;
        break;
    }
    if (!chat.chat) return null;
    const isEmpty =
      chat.chat.messages.length === 0 && chat.chat.executions.length === 0 && !chat.pendingSend;
    if (isEmpty) return emptyState;
    return (
      <div className="animate-in fade-in duration-300">
        <ChatTranscript chat={chat.chat} pendingSend={chat.pendingSend} />
      </div>
    );
  };

  return (
    <div ref={paneRef} className={cn('flex h-full min-h-0 flex-col', onStart && 'bg-white')}>
      {/* No border or fill: the title and its controls float over the pane.
          The start screen has no chat yet, so no header. */}
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
          ) : titleLoading ? (
            <div className="flex min-w-0 flex-1 items-center" aria-busy="true">
              <div className="h-3.5 w-48 max-w-full animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <h2 className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-700">
              {title}
            </h2>
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
          {chatId != null && !renaming && (
            <ChatMenu
              title={title}
              onRename={() => setRenaming(true)}
              onDelete={() => void state.deleteChat(chatId)}
            />
          )}
          {headerActions}
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
