'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PanelRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { useAIMode } from './AIModeContext';
import { ChatPane } from './ChatPane';
import { ConversationList } from './ConversationList';
import { DocumentCard } from './DocumentCard';
import { DocumentPane } from './DocumentPane';
import { useAIModeChat } from './useAIModeChat';
import type { NotebookTab } from '@/components/Notebook/NotebookTabs';
import type { PublishingDefaultArticleType } from '@/contexts/PublishingHostContext';
import { useAIModeDocument } from './useAIModeDocument';
import { AI_MODE_NAME } from './copy';

/** Above the overlay (9500), below BaseModal (9999). */
const AI_MODE_DRAWER_Z_INDEX = 9600;

const LIST_MIN_WIDTH = 200;
const LIST_MAX_WIDTH = 440;
const LIST_DEFAULT_WIDTH = 264;
const CHAT_MIN_WIDTH = 360;
const DOCUMENT_MIN_WIDTH = 420;
/** The details form needs more room than the document: authors, image, funding fields. */
const DETAILS_MIN_WIDTH = 560;
/** Share of the viewport the document opens at before the user drags it. */
const DOCUMENT_DEFAULT_SHARE = 0.55;

/**
 * A modal that portals outside the overlay (BaseModal, a drawer) is showing.
 * Closed drawers stay mounted off-screen with `role="dialog"`, so presence in
 * the DOM is not enough — the box has to intersect the viewport.
 */
function isForeignDialogOpen(): boolean {
  const overlay = document.getElementById('ai-mode-overlay');
  return Array.from(document.querySelectorAll('[role="dialog"]')).some((el) => {
    if (overlay?.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  });
}

/**
 * The full-viewport shell: header, conversation list, chat, document. Sits
 * below BaseModal (9999) and Tooltip (10000) so real modals and tooltips
 * opened from inside it still render on top.
 */
export function AIModeOverlay() {
  const { close } = useAIMode();
  const state = useAIModeChat();
  // Below the tablet breakpoint the list lives in a bottom drawer.
  const [listDrawerOpen, setListDrawerOpen] = useState(false);
  const closeListDrawer = useCallback(() => setListDrawerOpen(false), []);

  const doc = useAIModeDocument({
    note: state.note,
    chat: state.chat.chat,
    latestExecution: state.chat.latestExecution,
  });

  // Tailwind's `tablet` breakpoint; the drawer only exists below it.
  const isBelowTablet = useMediaQuery('(max-width: 767px)') === true;

  // ---- pane widths, claude.ai style: both side panes drag, the chat takes the rest ----
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  );
  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const listWidth = useResizableWidth({
    storageKey: 'ai-mode:list-width',
    min: LIST_MIN_WIDTH,
    max: LIST_MAX_WIDTH,
    defaultWidth: LIST_DEFAULT_WIDTH,
    anchor: 'left',
  });
  // Document or details in the right pane; details wants a wider floor.
  const [documentTab, setDocumentTab] = useState<NotebookTab>('document');
  const documentMinWidth = documentTab === 'details' ? DETAILS_MIN_WIDTH : DOCUMENT_MIN_WIDTH;
  // The document may grow until the chat is down to its minimum column.
  const documentMaxWidth = Math.max(
    documentMinWidth,
    viewportWidth - listWidth.width - CHAT_MIN_WIDTH
  );
  const documentWidth = useResizableWidth({
    storageKey: 'ai-mode:document-width',
    min: documentMinWidth,
    max: documentMaxWidth,
    defaultWidth: (width) => width * DOCUMENT_DEFAULT_SHARE,
    anchor: 'right',
  });
  const isBelowTabletRef = useRef(isBelowTablet);
  isBelowTabletRef.current = isBelowTablet;

  // On desktop the document pane opens by itself the moment a conversation
  // gains a note. On mobile it never opens by itself — the card in the
  // transcript is the way in, and it opens a drawer. Either way the user can
  // close it and reopen it from the card or the chat header.
  const noteId = state.note?.id ?? null;
  const [documentOpen, setDocumentOpen] = useState(false);
  useEffect(() => {
    setDocumentOpen(noteId != null && !isBelowTabletRef.current);
    setDocumentTab('document');
  }, [noteId]);

  // What the conversation set out to write, from its opening message, so the
  // details form preselects the matching work type for a note that has none.
  const defaultArticleType = useMemo<PublishingDefaultArticleType | null>(() => {
    const opening = state.chat.chat?.messages.find((message) => message.role === 'user')?.content;
    if (!opening) return null;
    if (/request for proposals|\bRFP\b/i.test(opening)) return 'grant';
    if (/proposal/i.test(opening)) return 'preregistration';
    return null;
  }, [state.chat.chat?.messages]);
  const openDocument = useCallback(() => setDocumentOpen(true), []);
  const closeDocument = useCallback(() => setDocumentOpen(false), []);
  const showDocument = noteId != null && documentOpen;

  // The turn that created the document, for seating its card in the transcript.
  const documentCardExecutionId = useMemo(() => {
    if (noteId == null) return null;
    for (const execution of state.chat.chat?.executions ?? []) {
      const created = (execution.activity ?? []).some(
        (item) =>
          item.type === 'tool_call' &&
          item.tool === 'create_note' &&
          item.status === 'succeeded' &&
          item.note_id === noteId
      );
      if (created) return execution.id;
    }
    return null;
  }, [noteId, state.chat.chat]);
  const documentCard =
    noteId != null ? (
      <DocumentCard
        title={doc.content?.title?.trim() || state.note?.title?.trim() || 'Document'}
        status={doc.status}
        open={showDocument}
        onOpen={openDocument}
      />
    ) : null;

  // Esc closes, unless something inside already claimed it (a menu, a modal
  // that portals outside the overlay).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (isForeignDialogOpen()) return;
      close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  // A real modal: the overlay portals to the body and everything else at
  // the top level goes inert while it is open, so nothing behind it — a
  // notebook editor that autofocuses late, say — can take focus or keys.
  // Layers that mount later (menus, tooltips, modals) append after and stay
  // live; the overlay's own drawers render inside it.
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!rootEl) return;
    rootEl.focus();
    const inerted: Element[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child === rootEl || child.tagName === 'SCRIPT' || child.tagName === 'NEXTJS-PORTAL') {
        continue;
      }
      if (child.hasAttribute('inert')) continue;
      child.setAttribute('inert', '');
      inerted.push(child);
    }
    return () => {
      for (const child of inerted) child.removeAttribute('inert');
    };
  }, [rootEl]);

  // Lock the page behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const conversationList = (
    <ConversationList
      chats={state.list.chats}
      access={state.list.access}
      accessDetail={state.list.accessDetail}
      activeChatId={state.chatId}
      titleFor={state.titleFor}
      onSelect={(chatId) => {
        state.selectChat(chatId);
        closeListDrawer();
      }}
      onNew={() => {
        state.startNewChat();
        closeListDrawer();
      }}
      onRename={state.rename}
      onDelete={state.deleteChat}
      onRetry={state.list.refresh}
    />
  );

  return createPortal(
    <div
      id="ai-mode-overlay"
      ref={setRootEl}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={AI_MODE_NAME}
      className="fixed inset-0 z-[9500] flex flex-col bg-gray-50 outline-none"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-gray-900">{AI_MODE_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-400 tablet:!inline">Esc to close</span>
          <button
            type="button"
            onClick={close}
            aria-label={`Close ${AI_MODE_NAME}`}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside
          style={{ width: listWidth.width }}
          className="relative hidden shrink-0 flex-col border-r border-gray-200 bg-gray-100 tablet:!flex"
        >
          {conversationList}
          <ResizeHandle
            label="Resize conversations"
            side="right"
            value={listWidth.width}
            min={LIST_MIN_WIDTH}
            max={LIST_MAX_WIDTH}
            isResizing={listWidth.isResizing}
            onStart={listWidth.startResize}
            onNudge={listWidth.nudgeWidth}
          />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <ChatPane
            state={state}
            onOpenConversations={() => setListDrawerOpen(true)}
            documentCard={documentCard}
            documentCardExecutionId={documentCardExecutionId}
            headerActions={
              noteId != null && (
                <button
                  type="button"
                  onClick={() => setDocumentOpen((open) => !open)}
                  aria-pressed={showDocument}
                  aria-label={showDocument ? 'Hide document' : 'Show document'}
                  title={showDocument ? 'Hide document' : 'Show document'}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors',
                    showDocument
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <PanelRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            }
          />
        </main>
        {/* One editor per note at a time: the pane mounts in the column above
            the tablet breakpoint and in the drawer below it, never both. */}
        {showDocument && !isBelowTablet && (
          <aside
            style={{ width: documentWidth.width }}
            className="relative flex shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white"
          >
            <ResizeHandle
              label="Resize document"
              side="left"
              value={documentWidth.width}
              min={documentMinWidth}
              max={documentMaxWidth}
              isResizing={documentWidth.isResizing}
              onStart={documentWidth.startResize}
              onNudge={documentWidth.nudgeWidth}
            />
            <DocumentPane
              document={doc}
              chat={state.chat.chat}
              tab={documentTab}
              onTabChange={setDocumentTab}
              defaultArticleType={defaultArticleType}
            />
          </aside>
        )}
      </div>

      {/* Drawers portal to the body, so they need to stack above this overlay
          (z-9500) while staying under BaseModal (9999). */}
      <SwipeableDrawer
        isOpen={listDrawerOpen}
        onClose={closeListDrawer}
        height="70vh"
        zIndex={AI_MODE_DRAWER_Z_INDEX}
        container={rootEl}
      >
        {conversationList}
      </SwipeableDrawer>
      <SwipeableDrawer
        isOpen={showDocument && isBelowTablet}
        onClose={closeDocument}
        height="85vh"
        className="tablet:!hidden"
        zIndex={AI_MODE_DRAWER_Z_INDEX}
        container={rootEl}
      >
        {showDocument && isBelowTablet && (
          <DocumentPane
            document={doc}
            chat={state.chat.chat}
            tab={documentTab}
            onTabChange={setDocumentTab}
            defaultArticleType={defaultArticleType}
            readOnly
            className="-mx-4 -mt-2"
          />
        )}
      </SwipeableDrawer>
    </div>,
    document.body
  );
}
