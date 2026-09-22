'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, MessageSquarePlus, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useAgentChatList } from '@/hooks/useAgentChat';
import { useChatSession } from '@/hooks/useChatSession';
import { getChatTransport } from '@/services/chatTransport';
import { useJumpToLatest } from '@/hooks/useJumpToLatest';
import { MAX_AGENT_CHAT_WIDTH, MIN_AGENT_CHAT_WIDTH } from '@/hooks/useAgentChatWidth';
import { isRfpNote } from '@/types/note';
import { MAX_CHAT_TITLE_LENGTH, type AgentChat } from '@/types/agentChat';
import { ENDOWMENT_PROMO_BANNER_FEATURE } from '@/app/layouts/components/EndowmentPromoBanner';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useEditorIsEmpty } from '@/hooks/useEditorIsEmpty';
import { belowMobileTopBar } from '@/components/Notebook/mobileBarOffsets';
import { NoteReviewControls } from '@/components/Notebook/NoteReview/NoteReviewControls';
import { NoteReviewBanner } from '@/components/Notebook/NoteReview/NoteReviewBanner';
import { useNoteAgentReview } from '@/components/Notebook/NoteReview/useNoteAgentReview';
import { ChatComposer } from '@/components/AgentChat/ChatComposer';
import type { ChatNoticePolicy } from '@/components/AgentChat/chatNotices';
import { ChatPicker } from '@/components/AgentChat/ChatPicker';
import { ChatPresets } from '@/components/AgentChat/ChatPresets';
import { ChatSources, collectChatSources } from '@/components/AgentChat/ChatSources';
import { ChatTranscript } from '@/components/AgentChat/ChatTranscript';
import { CreditMeter } from '@/components/AgentChat/CreditMeter';
import { canSelectAIModel } from '@/types/researchAI';
import { ModelControls } from '@/components/AgentChat/ModelControls';
import { Logo } from '@/components/ui/Logo';

type PanelTab = 'chat' | 'sources';

/** Pixels per arrow key press while the resize divider has focus. */
const RESIZE_KEY_STEP = 24;

/** The meter beside the composer already says when the budget is spent. */
const NOTICES: ChatNoticePolicy = { noun: 'chat', usageLimit: 'meter' };

/**
 * A running in-note review session, handed to the host so the accept/reject
 * controls can live on the note page rather than in the chat panel.
 */
export interface NoteReviewHandle {
  readonly changeCount: number;
  /** Keep the assistant's side: deletes the struck ranges, keeps the rest. */
  readonly accept: () => void;
  /** Keep the reader's side: deletes the inserted ranges and persists it. */
  readonly reject: () => void;
}

interface AgentChatPanelProps {
  readonly noteId: string;
  readonly open: boolean;
  readonly onClose: () => void;
  /** The server denied access (gate changed / signed out) — hide the entry point. */
  readonly onUnavailable: () => void;
  /**
   * The editor's current document must be persisted as a new server version:
   * the user chose "Keep mine" over an assistant version, or a reload applied
   * an assistant version that newer saves had buried. Applying content
   * programmatically emits no editor update, so without this save the choice
   * would only live in this editor instance and vanish on the next load.
   * Persists immediately and resolves with whether the save reached the
   * server — the panel acknowledges the choice only on success.
   */
  readonly onPersistEditorState?: () => Promise<boolean>;
  /**
   * Docked (desktop) mode: the panel takes `width` and the host reserves the
   * same gutter, so it sits beside the document instead of over it. Undocked,
   * it covers the viewport as a sheet.
   */
  readonly docked: boolean;
  readonly width: number;
  readonly isResizing: boolean;
  readonly onResizeStart: () => void;
  /** Keyboard resize from the divider; negative widens the panel. */
  readonly onResizeNudge: (deltaX: number) => void;
  /**
   * An in-note review started or ended. The host renders the accept/restore
   * controls over the note; null means no review is active.
   */
  readonly onReviewChange?: (review: NoteReviewHandle | null) => void;
}

/**
 * The notebook AI assistant panel: chat picker, transcript with live turn
 * progress, and composer. Stays mounted while the notebook is open so chat
 * selection and drafts survive closing the panel. Chat requests are gated on
 * `open`; user-wide allowances load with the notebook.
 */
export function AgentChatPanel({
  noteId,
  open,
  onClose,
  onUnavailable,
  onPersistEditorState,
  docked,
  width,
  isResizing,
  onResizeStart,
  onResizeNudge,
  onReviewChange,
}: AgentChatPanelProps) {
  const { editor, currentNote } = useNotebookContext();
  // Decide which writing preset the empty chat screen offers, and what it
  // calls the document: the notebook holds RFPs as well as proposals.
  const noteIsEmpty = useEditorIsEmpty(editor);
  const noteIsRfp = isRfpNote(currentNote);

  // Mirrors PageLayout: the promo banner sits above the TopBar on mobile, and
  // this panel hangs from the bar's underside, so it has to know.
  const { isDismissed: promoDismissed, dismissStatus: promoStatus } = useDismissableFeature(
    ENDOWMENT_PROMO_BANNER_FEATURE
  );
  const promoBannerVisible = promoStatus === 'checked' && !promoDismissed;

  // One transport per note: the hooks reset on its identity.
  const transport = getChatTransport({ noteId });
  const list = useAgentChatList(transport, open);
  // Null is the new-chat screen, and it is where a page visit starts: the
  // assistant opens on its own opening moves rather than dropping the reader
  // into the middle of whatever they last asked. Earlier chats stay one click
  // away in the picker, and a selection survives closing the panel — only a
  // fresh visit or a note switch resets it.
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const switchChat = useCallback((nextChatId: number | null) => setSelectedChatId(nextChatId), []);

  // Network activity is gated on `open`. No keep-alive is needed for turns
  // that finish while the panel is closed or another chat is selected: the
  // note version socket below reports agent edits from any chat, and
  // reopening (or reselecting) refetches the transcript.
  const refreshList = list.refresh;
  const onListStale = useCallback(() => {
    if (open) refreshList();
  }, [open, refreshList]);
  const onChatCreated = useCallback((created: AgentChat) => {
    setSelectedChatId(created.conversation_id);
  }, []);
  const session = useChatSession({
    transport,
    chatId: selectedChatId,
    enabled: open,
    onChatCreated,
    onListStale,
    notices: NOTICES,
  });
  const {
    chat: chatState,
    modelSelection,
    researchAI,
    draft,
    setDraft: updateDraft,
    notice,
    clearNotice,
    sendBlocked: budgetSendDisabled,
    composerBusy,
    canStop,
    send,
  } = session;
  const hasModelSelection = canSelectAIModel(researchAI.budget?.tier);
  const canSelectModel = hasModelSelection && researchAI.catalog !== null;

  const composerRef = useRef<HTMLTextAreaElement>(null);

  /**
   * A preset loads the composer rather than sending: its message is a starting
   * point, and the details that make it worth sending — the deadline, the
   * section, the sub-field — are the user's to add. Focus follows the text so
   * the caret is already waiting at the end of it.
   */
  const applyPreset = useCallback(
    (message: string) => {
      clearNotice();
      updateDraft(message);
      const textarea = composerRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(message.length, message.length);
    },
    [clearNotice, updateDraft]
  );

  // ---- a note switch starts on the new-chat screen ----
  useEffect(() => {
    setSelectedChatId(null);
  }, [noteId]);

  // ---- server-side access gate ----
  const [deniedNoteId, setDeniedNoteId] = useState<string | null>(null);
  const accessNoteRef = useRef(noteId);
  useEffect(() => {
    if (accessNoteRef.current !== noteId) {
      accessNoteRef.current = noteId;
      setDeniedNoteId(null);
      // The chat hooks reset after a note switch; their current access values
      // can still belong to the previous note on this render.
      return;
    }
    if (list.access === 'hidden' || chatState.access === 'unauthorized') {
      setDeniedNoteId(noteId);
    }
  }, [noteId, list.access, chatState.access]);
  const accessDenied = deniedNoteId === noteId;

  useEffect(() => {
    // Leave a visible restriction until the user closes the panel. A blocked
    // account keeps the entry point so its unavailable state remains reachable.
    if (
      !open &&
      researchAI.budgetStatus !== 'loading' &&
      researchAI.budget?.tier !== 'blocked' &&
      accessDenied
    ) {
      onUnavailable();
    }
  }, [open, accessDenied, onUnavailable, researchAI.budgetStatus, researchAI.budget?.tier]);

  // ---- rename ----
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const startRename = () => {
    if (selectedChatId == null) return;
    setRenameValue(chatState.chat?.title ?? '');
    setRenaming(true);
  };

  const sessionKeyRef = useRef(session.sessionKey);
  sessionKeyRef.current = session.sessionKey;
  const commitRename = async () => {
    setRenaming(false);
    const title = renameValue.trim();
    if (!title || title === (chatState.chat?.title ?? '')) return;
    const key = session.sessionKey;
    const renamed = await chatState.rename(title);
    // A rename that raced a switch must not fire its note-bound refresh — the
    // stale fetch would outrank and replace the current note's listing.
    if (renamed && sessionKeyRef.current === key) refreshList();
  };

  // A rename left open across a note switch would commit against whichever
  // chat the new note auto-selects — it dies with the note that owned it.
  useEffect(() => {
    setRenaming(false);
  }, [noteId]);

  // ---- assistant-version review of the note ----
  // The editor is the notebook's own; the hook keeps it in step with the
  // versions the assistant writes and hands back the review to render.
  const loadedNote = useMemo(
    () => (currentNote ? { id: currentNote.id, versionId: currentNote.versionId } : null),
    [currentNote]
  );
  const noteReview = useNoteAgentReview({
    noteId,
    editor,
    loadedNote,
    chat: chatState.chat,
    onPersistEditorState,
  });
  const { review, accept: acceptReview, reject: rejectReview } = noteReview;

  // The accept/reject controls render on the note page, next to the content
  // they decide about — hand the host the current session, and null when it
  // ends or this panel unmounts.
  useEffect(() => {
    if (!onReviewChange) return;
    onReviewChange(
      review == null
        ? null
        : { changeCount: review.changeCount, accept: acceptReview, reject: rejectReview }
    );
    return () => onReviewChange(null);
  }, [review, onReviewChange, acceptReview, rejectReview]);

  // ---- chat / sources tabs ----
  const sources = useMemo(() => collectChatSources(chatState.chat), [chatState.chat]);
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  // A new chat starts with no citations, so a lingering Sources tab would open
  // on an empty list.
  useEffect(() => {
    setActiveTab('chat');
  }, [selectedChatId, noteId]);

  // ---- transcript auto-scroll ----
  const { scrollRef, handleScroll, follow } = useJumpToLatest<HTMLDivElement>({
    resetKey: selectedChatId,
  });
  useEffect(() => {
    // The sources list shares this scroller; pinning it to the bottom on every
    // transcript update would yank the citation the user is reading.
    if (activeTab === 'chat') follow();
  }, [chatState.chat, chatState.pendingSend, activeTab, follow]);

  // ---- derived composer state ----
  const chatAccessible = selectedChatId == null ? list.access === 'ok' : chatState.access === 'ok';
  const composerDisabled = accessDenied || !chatAccessible;

  const emptyState = (
    <EmptyState
      noteIsEmpty={noteIsEmpty}
      noteIsRfp={noteIsRfp}
      onSelectPreset={applyPreset}
      presetsDisabled={composerDisabled}
    />
  );

  const renderBody = () => {
    if (
      researchAI.budget?.tier === 'blocked' ||
      accessDenied ||
      list.access === 'hidden' ||
      chatState.access === 'unauthorized'
    ) {
      return (
        <output className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-600">
          You do not have access to the research assistant for this notebook.
        </output>
      );
    }
    if (selectedChatId == null) {
      if (list.access === 'loading') return <CenteredLoader />;
      if (list.access === 'error') {
        return <ErrorState message="Couldn’t load your chats." onRetry={() => refreshList()} />;
      }
      return emptyState;
    }

    switch (chatState.access) {
      case 'loading':
        return <CenteredLoader />;
      case 'not_found':
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-gray-600">This chat is no longer available.</p>
            <Button variant="outlined" size="sm" onClick={() => switchChat(null)}>
              Start a new chat
            </Button>
          </div>
        );
      case 'error':
        return (
          <ErrorState message="Couldn’t load this chat." onRetry={() => chatState.refetch()} />
        );
      default: {
        if (!chatState.chat) return <CenteredLoader />;
        const isEmpty =
          chatState.chat.messages.length === 0 &&
          chatState.chat.executions.length === 0 &&
          !chatState.pendingSend;
        if (isEmpty) return emptyState;
        return <ChatTranscript chat={chatState.chat} pendingSend={chatState.pendingSend} />;
      }
    }
  };

  return (
    <aside
      aria-label="Research assistant"
      aria-hidden={!open}
      // Off-screen means out of the tab order too — pointer-events alone
      // still leaves the hidden controls keyboard-focusable.
      inert={!open}
      style={{ width: docked ? width : undefined }}
      className={cn(
        // Above the mobile bottom nav (z-[100]), which would otherwise cover
        // the composer while the sheet is open.
        'fixed bottom-0 right-0 z-[110] flex flex-col border-l border-gray-200 bg-white',
        'shadow-[-8px_0_28px_-16px_rgba(31,30,27,0.22)]',
        // The header carries the only control that closes the panel, so the
        // top edge has to clear the mobile top bar — and the promo banner
        // above it — or the panel becomes a room with no door.
        belowMobileTopBar(promoBannerVisible),
        !docked && 'w-full',
        // A transition during a drag lags the pointer.
        !isResizing && 'transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      )}
    >
      {docked && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant panel"
          aria-valuenow={width}
          aria-valuemin={MIN_AGENT_CHAT_WIDTH}
          aria-valuemax={MAX_AGENT_CHAT_WIDTH}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            onResizeStart();
          }}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            onResizeNudge(event.key === 'ArrowLeft' ? -RESIZE_KEY_STEP : RESIZE_KEY_STEP);
          }}
          className="group absolute inset-y-0 -left-1 z-10 w-2 cursor-col-resize focus:outline-none"
        >
          <div
            className={cn(
              'mx-auto h-full w-0.5 transition-colors group-hover:bg-primary-300 group-focus:bg-primary-400',
              isResizing ? 'bg-primary-400' : 'bg-transparent'
            )}
          />
        </div>
      )}

      <header className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2">
        {renaming ? (
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={renameValue}
              maxLength={MAX_CHAT_TITLE_LENGTH}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitRename();
                if (event.key === 'Escape') setRenaming(false);
              }}
              onBlur={commitRename}
              aria-label="Chat title"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-1.5 py-0.5 text-sm font-medium text-gray-800 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitRename}
              title="Save title"
              className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Save title</span>
            </button>
          </div>
        ) : (
          // Rename belongs to the title, not to the panel: seated inside the
          // picker rather than out with the panel actions, so the row reads as
          // two groups instead of a run of three unrelated icons.
          <ChatPicker
            chats={list.chats}
            activeChatId={selectedChatId}
            activeTitle={chatState.chat?.title ?? null}
            onSelect={switchChat}
            onOpen={() => refreshList()}
            titleAction={
              selectedChatId != null ? (
                <button
                  type="button"
                  onClick={startRename}
                  title="Rename chat"
                  className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Rename chat</span>
                </button>
              ) : null
            }
          />
        )}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => switchChat(null)}
            title="New chat"
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">New chat</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close assistant"
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close assistant</span>
          </button>
        </div>
      </header>

      {sources.length > 0 && (
        <div
          role="tablist"
          aria-label="Assistant views"
          className="flex items-center gap-1 border-b border-gray-100 px-3 py-1.5"
        >
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            label="Chat"
          />
          <TabButton
            active={activeTab === 'sources'}
            onClick={() => setActiveTab('sources')}
            label="Sources"
            count={sources.length}
          />
        </div>
      )}

      {/* Undocked, this panel covers the note, so the controls floating over it
          are behind the panel and cannot be reached — while any save meanwhile
          persists the assistant's side. Carry them here instead, so the choice
          stays available on the surface the reader is looking at. Docked, the
          note is beside the panel and keeps the floating copy (see
          NoteEditorLayout). */}
      {review && !docked && (
        <div className="flex justify-center border-b border-gray-100 px-3 py-2">
          <NoteReviewControls
            changeCount={review.changeCount}
            onAccept={acceptReview}
            onReject={rejectReview}
          />
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === 'sources' ? <ChatSources sources={sources} /> : renderBody()}
      </div>

      <NoteReviewBanner review={noteReview} className="mx-3 mb-2" />

      <ChatComposer
        textareaRef={composerRef}
        value={draft}
        onChange={updateDraft}
        onSend={() => void send()}
        onStop={chatState.cancel}
        busy={composerBusy}
        canStop={canStop}
        disabled={composerDisabled}
        sendDisabled={budgetSendDisabled}
        notice={notice}
        footer={
          <>
            <CreditMeter
              budget={researchAI.budget}
              budgetStatus={researchAI.budgetStatus}
              limitResetAt={researchAI.limitResetAt}
              onRefresh={() => {
                void researchAI.refreshBudget(true);
              }}
            />
            {hasModelSelection && researchAI.catalog === null && (
              <output className="mt-1 block text-[11px] text-amber-700">
                {researchAI.catalogStatus === 'loading'
                  ? 'Loading available AI models…'
                  : 'Couldn’t load available AI models.'}
                {researchAI.catalogStatus === 'unavailable' && (
                  <button
                    type="button"
                    onClick={() => {
                      void researchAI.refreshCatalog(true);
                    }}
                    className="ml-2 underline"
                  >
                    Retry
                  </button>
                )}
              </output>
            )}
          </>
        }
        toolbar={
          canSelectModel && (
            <ModelControls
              models={modelSelection.models}
              model={modelSelection.model}
              pinned={modelSelection.pinned}
              effortPinned={modelSelection.effortPinned}
              options={modelSelection.options}
              onSelectModel={modelSelection.selectModel}
              onChangeOptions={modelSelection.setOptions}
              disabled={composerDisabled || composerBusy || budgetSendDisabled}
              multiplierExplanation={modelSelection.multiplierExplanation}
            />
          )
        }
      />
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly label: string;
  readonly count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
        active ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      )}
    >
      {label}
      {count != null && (
        <span
          className={cn(
            'rounded-full px-1.5 text-[10px] font-semibold',
            active ? 'bg-white text-gray-600' : 'bg-gray-100 text-gray-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CenteredLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader size="md" className="text-primary-500" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-gray-600">{message}</p>
      <Button variant="outlined" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function EmptyState({
  noteIsEmpty,
  noteIsRfp,
  onSelectPreset,
  presetsDisabled,
}: {
  readonly noteIsEmpty: boolean;
  readonly noteIsRfp: boolean;
  readonly onSelectPreset: (message: string) => void;
  readonly presetsDisabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50">
          <Logo size={32} noText />
        </div>
        <div>
          <p className="flex items-center justify-center gap-1.5 font-serif text-lg tracking-tight text-gray-800">
            Research assistant
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Ask questions about this note, search the web and scholarly literature, or have the
            assistant edit the draft for you.
          </p>
        </div>
      </div>
      <ChatPresets
        noteIsEmpty={noteIsEmpty}
        isRfp={noteIsRfp}
        onSelect={onSelectPreset}
        disabled={presetsDisabled}
      />
    </div>
  );
}
