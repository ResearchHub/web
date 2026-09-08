'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';
import type { AIModeChatState } from './useAIModeChat';
import { aiModeGreeting, AI_MODE_STARTER_PROMPTS } from './copy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
  const { chatId, list, chat, modelSelection, draft, setDraft, notice, creatingChat } = state;
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // ---- transcript auto-scroll ----
  // Follows new content while the reader is at the bottom; never yanks the
  // view down once they have scrolled up, and offers a jump back instead.
  const { scrollRef, handleScroll, isAtBottom, jumpToLatest, follow } =
    useJumpToLatest<HTMLDivElement>({ resetKey: chatId });
  useEffect(() => {
    follow();
  }, [chat.chat, chat.pendingSend, follow]);

  // ---- title: inline rename from the header menu ----
  const [renaming, setRenaming] = useState(false);
  useEffect(() => {
    setRenaming(false);
  }, [chatId]);

  // A starter card is a complete first message: send it and start the
  // conversation rather than leaving it in the box to be sent by hand.
  const { user } = useUser();
  const startFromCard = useCallback(
    (message: string) => {
      state.clearNotice();
      void state.sendText(message);
    },
    [state]
  );

  const listBlocked = list.access === 'hidden';
  const chatUnavailable =
    chatId != null && (chat.access === 'not_found' || chat.access === 'unauthorized');
  const composerDisabled =
    listBlocked || chatUnavailable || (chatId != null && chat.access === 'loading');
  const composerBusy = chat.isBusy || creatingChat;
  // Stop must only be offered when there is a turn to cancel server-side.
  const canStop = chat.latestExecution != null && chat.isBusy && chat.pendingSend == null;

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
      onSend={state.send}
      onStop={state.stop}
      busy={composerBusy}
      canStop={canStop}
      disabled={composerDisabled}
      notice={notice}
      className="border-t-0 bg-gray-50"
      placeholder="Describe what you want to work on…"
      toolbar={
        <ModelControls
          models={modelSelection.models}
          model={modelSelection.model}
          pinned={modelSelection.pinned}
          options={modelSelection.options}
          onSelectModel={modelSelection.selectModel}
          onChangeOptions={modelSelection.setOptions}
          disabled={composerDisabled}
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
            onDelete={() => state.deleteChat(chatId)}
          />
        )}
        {headerActions}
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
          <div className="mx-auto w-full max-w-[760px] px-4 py-5 tablet:!px-6">
            {listBlocked ? (
              <AccessBlocked detail={list.accessDetail} />
            ) : chatId == null ? (
              <EmptyState
                composer={composer}
                greeting={aiModeGreeting(user?.firstName)}
                onSelectStarter={startFromCard}
                disabled={composerBusy}
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

function EmptyState({
  composer,
  greeting,
  onSelectStarter,
  disabled,
}: {
  readonly composer: ReactNode;
  readonly greeting: string;
  readonly onSelectStarter: (message: string) => void;
  readonly disabled: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
          <Logo size={34} noText />
        </div>
        <h2 className="font-serif text-3xl tracking-tight text-gray-900">{greeting}</h2>
      </div>

      <div className="-mx-3">{composer}</div>

      {/* Picking a card starts the conversation with its message. */}
      <div className="grid grid-cols-1 gap-3 tablet:!grid-cols-3">
        {AI_MODE_STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelectStarter(prompt.message)}
            disabled={disabled}
            className={cn(
              'group flex h-full min-h-[120px] flex-col items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-4 text-center transition-colors',
              'hover:border-primary-200 hover:bg-primary-50',
              'focus:outline-none focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-white">
              <FontAwesomeIcon icon={prompt.icon} className="h-[18px] w-[18px] text-gray-700" />
            </span>
            <span className="text-sm font-semibold tracking-[0.01em] text-gray-900">
              {prompt.title}
            </span>
            <span className="text-xs text-gray-600">{prompt.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
