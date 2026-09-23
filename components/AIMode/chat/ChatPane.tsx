'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import { ChatTranscript } from '@/components/AgentChat/ChatTranscript';
import { JumpToLatestButton } from '@/components/AgentChat/JumpToLatestButton';
import { ModelControls } from '@/components/AgentChat/ModelControls';
import { useJumpToLatest } from '@/hooks/useJumpToLatest';
import { ConversationMenu } from '../sidebar/ConversationMenu';
import { ConversationTitleField } from './ConversationTitleField';
import { conversationTitleFor } from './conversationTitle';
import { Button } from '@/components/ui/Button';
import { ChatTranscriptSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { cn } from '@/utils/styles';
import { layoutFor } from '../AIModeContext';
import type { AIModeChatState } from '../useAIModeChat';
import { aiModeGreeting } from '../copy';
import { StartContextChips } from '../start/StartContextChips';
import {
  START_COMPOSER_MIN_ROWS,
  startComposerBoxClass,
  startComposerPlaceholder,
  startComposerSendClass,
} from '../start/startComposer';
import { StartScreen } from '../start/StartScreen';
import { DocumentChatEmptyState } from './DocumentChatEmptyState';
import { useUser } from '@/contexts/UserContext';

interface ChatPaneProps {
  readonly state: AIModeChatState;
  /** Header controls seated right of the title — the document toggle. */
  readonly headerActions?: ReactNode;
  /** Below the tablet breakpoint the list is a drawer; this opens it. */
  readonly onOpenConversations?: () => void;
  /**
   * The document's card, and the turn it belongs under. With no matching
   * turn (activity not loaded for it) the card trails the transcript instead.
   */
  readonly documentCard?: ReactNode;
  readonly documentCardExecutionId?: number | null;
}

/** The middle pane: transcript, live progress, and the composer. */
export function ChatPane({
  state,
  headerActions,
  onOpenConversations,
  documentCard,
  documentCardExecutionId,
}: ChatPaneProps) {
  const { chatId, list, chat, modelSelection, draft, setDraft, notice, composerBusy, canStop } =
    state;
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const onDocument = state.target.kind === 'document';
  // The new-conversation screen: white, untitled, the composer in the middle.
  const onStart = chatId == null && !onDocument;

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

  // The new-conversation screen is there to be typed into: the caret is in
  // the box the moment it opens, whichever door it opened from.
  useEffect(() => {
    if (onStart) composerRef.current?.focus();
  }, [onStart, chatId]);

  const { user } = useUser();

  const listBlocked = list.access === 'hidden';
  const chatUnavailable =
    chatId != null && (chat.access === 'not_found' || chat.access === 'unauthorized');
  const composerDisabled =
    listBlocked || chatUnavailable || (chatId != null && chat.access === 'loading');

  const { currentTitle, title, loading: titleLoading } = conversationTitleFor(state);
  // With the chat as the main pane the workspace's top strip already names
  // it, so the pane's own header carries only the controls.
  const chatIsMain = layoutFor(state.target) === 'chat';

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
      onSend={state.send}
      onStop={state.stop}
      busy={composerBusy}
      canStop={canStop}
      disabled={composerDisabled}
      sendDisabled={state.sendBlocked}
      notice={notice}
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
      // The model and effort sit under the box, at its right, out of the message's way.
      footer={<div className="mt-1.5 flex justify-end pr-0.5">{modelControls}</div>}
    />
  );

  return (
    <div className={cn('flex h-full min-h-0 flex-col', onStart && 'bg-white')}>
      {/* No border or fill: the title and its controls float over the pane. */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-3">
        {onOpenConversations && (
          <button
            type="button"
            onClick={onOpenConversations}
            aria-label="Show conversations and documents"
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 tablet:!hidden"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
        {renaming && chatId != null ? (
          <ConversationTitleField
            initialValue={currentTitle ?? ''}
            className="max-w-md flex-1"
            onCancel={() => setRenaming(false)}
            onCommit={(value) => {
              setRenaming(false);
              const next = value.trim();
              if (next && next !== (currentTitle ?? '')) state.rename(chatId, next);
            }}
          />
        ) : chatIsMain ? (
          <span className="flex-1" />
        ) : titleLoading ? (
          <div className="flex min-w-0 flex-1 items-center" aria-busy="true">
            <div className="h-3.5 w-56 max-w-full animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{title}</h1>
        )}
        {chatId != null && !renaming && (
          <ConversationMenu
            title={title}
            onRename={() => setRenaming(true)}
            onDelete={(options) => state.deleteChat(chatId, options)}
            loadNotes={() => state.notesForChat(chatId)}
          />
        )}
        {headerActions}
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
          <div
            ref={contentRef}
            className={cn(
              'mx-auto w-full px-4 py-5 tablet:!px-6',
              // The start screen seats the journey rail beside the composer.
              onStart ? 'max-w-[1100px]' : 'max-w-[760px]'
            )}
          >
            {listBlocked ? (
              <AccessBlocked detail={list.accessDetail} />
            ) : chatId == null && onDocument ? (
              <DocumentChatEmptyState />
            ) : chatId == null ? (
              <StartScreen
                composer={composer}
                greeting={aiModeGreeting(user?.firstName)}
                intent={state.intent}
              />
            ) : chat.access === 'loading' && chat.chat == null ? (
              <ChatTranscriptSkeleton />
            ) : chat.access === 'not_found' ? (
              <p className="py-16 text-center text-sm text-gray-600">
                This conversation is no longer available.
              </p>
            ) : chat.access === 'unauthorized' ? (
              <AccessBlocked detail={null} />
            ) : chat.access === 'error' && chat.chat == null ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-gray-600">Couldn’t load this conversation.</p>
                <Button variant="outlined" size="sm" onClick={chat.refetch}>
                  Try again
                </Button>
              </div>
            ) : chat.chat ? (
              <div className="animate-in fade-in duration-300">
                <ChatTranscript
                  chat={chat.chat}
                  pendingSend={chat.pendingSend}
                  renderExecutionExtra={
                    documentCard && documentCardExecutionId != null
                      ? (execution) =>
                          execution.id === documentCardExecutionId ? (
                            <div className="pt-1">{documentCard}</div>
                          ) : null
                      : undefined
                  }
                />
                {documentCard && documentCardExecutionId == null && (
                  <div className="mt-5">{documentCard}</div>
                )}
              </div>
            ) : null}
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

      {/* A conversation keeps the composer docked at the bottom, as does a
          document's chat before it starts; the new-conversation screen seats
          it in the middle. */}
      {(chatId != null || onDocument) && (
        <div className="shrink-0 border-t border-gray-200 bg-gray-50">
          <div className={cn('mx-auto w-full max-w-[760px] px-3 py-3 tablet:!px-5')}>
            {composer}
          </div>
        </div>
      )}
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
