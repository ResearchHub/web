'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAIMode } from './AIModeContext';
import { ChatPane } from './ChatPane';
import { ConversationList } from './ConversationList';
import { DocumentCard } from './DocumentCard';
import { DocumentPane } from './DocumentPane';
import { useAIModeChat } from './useAIModeChat';
import { useAIModeDocument } from './useAIModeDocument';
import { AI_MODE_NAME } from './copy';

/** Above the overlay (9500), below BaseModal (9999). */
const AI_MODE_DRAWER_Z_INDEX = 9600;

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
  }, [noteId]);
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
      activeTitle={state.chat.chat?.title ?? null}
      notesByChat={state.notesByChat}
      onSelect={(chatId) => {
        state.selectChat(chatId);
        closeListDrawer();
      }}
      onNew={() => {
        state.startNewChat();
        closeListDrawer();
      }}
      onRename={state.rename}
      onRetry={state.list.refresh}
    />
  );

  return (
    <div
      id="ai-mode-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={AI_MODE_NAME}
      className="fixed inset-0 z-[9500] flex flex-col bg-gray-50"
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
        <aside className="hidden w-[264px] shrink-0 flex-col border-r border-gray-200 bg-white tablet:!flex">
          {conversationList}
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
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                    showDocument
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden tablet:!inline">Document</span>
                </button>
              )
            }
          />
        </main>
        {/* One editor per note at a time: the pane mounts in the column above
            the tablet breakpoint and in the drawer below it, never both. */}
        {showDocument && !isBelowTablet && (
          <aside className="flex w-[42%] min-w-[380px] max-w-[640px] shrink-0 flex-col border-l border-gray-200 bg-white">
            <DocumentPane document={doc} chat={state.chat.chat} onClose={closeDocument} />
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
      >
        {conversationList}
      </SwipeableDrawer>
      <SwipeableDrawer
        isOpen={showDocument && isBelowTablet}
        onClose={closeDocument}
        height="85vh"
        showCloseButton={false}
        className="tablet:!hidden"
        zIndex={AI_MODE_DRAWER_Z_INDEX}
      >
        {showDocument && isBelowTablet && (
          <DocumentPane
            document={doc}
            chat={state.chat.chat}
            onClose={closeDocument}
            readOnly
            className="-mx-4 -mt-2"
          />
        )}
      </SwipeableDrawer>
    </div>
  );
}
