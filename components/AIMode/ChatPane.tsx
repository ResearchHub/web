'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import { ChatTranscript } from '@/components/AgentChat/ChatTranscript';
import { JumpToLatestButton } from '@/components/AgentChat/JumpToLatestButton';
import { ModelControls } from '@/components/AgentChat/ModelControls';
import { useJumpToLatest } from '@/hooks/useJumpToLatest';
import { ConversationMenu } from './ConversationMenu';
import { ConversationTitleField } from './ConversationTitleField';
import { Button } from '@/components/ui/Button';
import { ChatTranscriptSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { cn } from '@/utils/styles';
import type { AIModeChatState } from './useAIModeChat';
import { aiModeGreeting, INTENT_COPY } from './copy';
import { StartScreen } from './start/StartScreen';
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

  // ---- transcript auto-scroll ----
  // Follows new content while the reader is at the bottom; never yanks the
  // view down once they have scrolled up, and offers a jump back instead.
  const { scrollRef, handleScroll, isAtBottom, jumpToLatest, follow } =
    useJumpToLatest<HTMLDivElement>({ resetKey: chatId });
  useEffect(() => {
    follow();
  }, [chat.chat, chat.pendingSend, follow]);
  // Text types out over many frames without the chat changing, so follow the
  // content's own growth too.
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => follow());
    observer.observe(el);
    return () => observer.disconnect();
  }, [follow, chatId]);

  // ---- title: inline rename from the header menu ----
  const [renaming, setRenaming] = useState(false);
  useEffect(() => {
    setRenaming(false);
  }, [chatId]);

  const { user } = useUser();

  const listBlocked = list.access === 'hidden';
  const chatUnavailable =
    chatId != null && (chat.access === 'not_found' || chat.access === 'unauthorized');
  const composerDisabled =
    listBlocked || chatUnavailable || (chatId != null && chat.access === 'loading');

  // The listing usually knows the title before the chat itself has loaded,
  // so a refresh doesn't flash "Untitled" while the transcript is fetched.
  const listedTitle =
    chatId == null ? null : (list.chats.find((item) => item.id === chatId)?.title ?? null);
  const currentTitle =
    chatId == null ? null : state.titleFor(chatId, chat.chat?.title ?? listedTitle);
  const titleLoading =
    chatId != null && currentTitle == null && (chat.chat == null || list.access === 'loading');
  const title =
    chatId == null ? 'New conversation' : (currentTitle?.trim() ?? '') || 'Untitled conversation';

  const composer = (
    <ChatComposer
      textareaRef={composerRef}
      value={draft}
      onChange={setDraft}
      onSend={() => void state.send()}
      onStop={state.stop}
      busy={composerBusy}
      canStop={canStop}
      disabled={composerDisabled}
      sendDisabled={state.sendBlocked}
      notice={notice}
      className="border-t-0 bg-gray-50"
      placeholder={chatId == null ? INTENT_COPY[state.intent].placeholder : undefined}
      toolbar={
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
        />
      }
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
        {onOpenConversations && (
          <button
            type="button"
            onClick={onOpenConversations}
            aria-label="Conversations"
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 tablet:!hidden"
          >
            <Menu className="h-4 w-4" />
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
          <div ref={contentRef} className="mx-auto w-full max-w-[760px] px-4 py-5 tablet:!px-6">
            {listBlocked ? (
              <AccessBlocked detail={list.accessDetail} />
            ) : chatId == null ? (
              <StartScreen
                composer={composer}
                greeting={aiModeGreeting(user?.firstName)}
                intent={state.intent}
                onIntentChange={state.setIntent}
                selectedGrant={state.selectedGrant}
                onSelectGrant={state.setSelectedGrant}
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

      {/* A conversation keeps the composer docked at the bottom; the
          new-conversation screen seats it in the middle with the starters. */}
      {chatId != null && (
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
