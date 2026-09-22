'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PanelRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { layoutFor, useAIMode } from './AIModeContext';
import { ChatPane } from './chat/ChatPane';
import { DocumentCard } from './chat/DocumentCard';
import { conversationTitleFor } from './chat/conversationTitle';
import { DocumentPane, type DocumentPaneView } from './document/DocumentPane';
import { useAIModeDocument } from './document/useAIModeDocument';
import { AIModeHeader } from './shell/AIModeHeader';
import { useModalOverlayBehavior } from './shell/useModalOverlayBehavior';
import { WorkspacePanes } from './shell/WorkspacePanes';
import { WorkspaceSidebar } from './sidebar/WorkspaceSidebar';
import { useAIModeChat } from './useAIModeChat';
import { AI_MODE_NAME } from './copy';

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
 * The full-viewport workspace: header, sidebar, chat, document. Sits below
 * BaseModal (9999) and Tooltip (10000) so real modals and tooltips opened
 * from inside it still render on top.
 */
export function AIModeOverlay() {
  const { close } = useAIMode();
  const state = useAIModeChat();
  const { target } = state;
  // A document opened from the sidebar comes first; a conversation's document sits beside it.
  const layout = layoutFor(target);
  // Below the tablet breakpoint the sidebar is a screen of its own, opened
  // from the chat header.
  const [listOpen, setListOpen] = useState(false);
  const closeList = useCallback(() => setListOpen(false), []);

  const doc = useAIModeDocument({
    note: state.note,
    chat: state.chat.chat,
    latestExecution: state.chat.latestExecution,
  });

  // Tailwind's `tablet` breakpoint; the drawers only exist below it.
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
  // Document or details in the document pane; details wants a wider floor.
  const [documentView, setDocumentView] = useState<DocumentPaneView>('document');
  const documentMinWidth = documentView === 'details' ? DETAILS_MIN_WIDTH : DOCUMENT_MIN_WIDTH;
  // The side pane is the document (chat first) or the chat (document first);
  // it may grow until the main pane is down to its own minimum column.
  const sideIsDocument = layout === 'chat';
  const sideMinWidth = sideIsDocument ? documentMinWidth : CHAT_MIN_WIDTH;
  const sideMaxWidth = Math.max(
    sideMinWidth,
    viewportWidth - listWidth.width - (sideIsDocument ? CHAT_MIN_WIDTH : DOCUMENT_MIN_WIDTH)
  );
  const sideWidth = useResizableWidth({
    storageKey: 'ai-mode:document-width',
    min: sideMinWidth,
    max: sideMaxWidth,
    defaultWidth: (width) => width * DOCUMENT_DEFAULT_SHARE,
    anchor: 'right',
  });
  const isBelowTabletRef = useRef(isBelowTablet);
  isBelowTabletRef.current = isBelowTablet;

  // On desktop the document pane opens by itself the moment a conversation
  // gains a note, and a document that comes first shows at once everywhere.
  // Otherwise on mobile the card in the transcript or the chat header is the
  // way in, and it opens a drawer. Either way the user can close it and
  // reopen it from there.
  const noteId = state.note?.id ?? null;
  const onDocument = target.kind === 'document';
  const [documentOpen, setDocumentOpen] = useState(false);
  useEffect(() => {
    setDocumentOpen(noteId != null && (layout === 'document' || !isBelowTabletRef.current));
    setDocumentView('document');
  }, [noteId, layout]);

  const openDocument = useCallback(() => setDocumentOpen(true), []);
  const closeDocument = useCallback(() => setDocumentOpen(false), []);
  const showDocument = noteId != null && documentOpen;
  const documentTitle = doc.content?.title?.trim() || state.note?.title?.trim() || 'Document';
  // The top strip names what is open: the conversation when the chat is the
  // main pane, the document when it is; nothing on the new-conversation screen.
  const { title: conversationTitle } = conversationTitleFor(state);
  const headerTitle =
    layout === 'document' ? documentTitle : target.chatId != null ? conversationTitle : null;

  // The document column puts its publish controls up in the header, where
  // they read as the workspace's, not the pane's. It renders into this slot.
  const [publishControlsSlot, setPublishControlsSlot] = useState<HTMLDivElement | null>(null);

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
  // A document opened from the sidebar is the main pane; no card needed.
  const documentCard =
    noteId != null && !onDocument ? (
      <DocumentCard
        title={documentTitle}
        status={doc.status}
        open={showDocument}
        onOpen={openDocument}
      />
    ) : null;

  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  useModalOverlayBehavior({ rootEl, onEscape: close });

  const documentPane = (presentation: 'pane' | 'drawer') => (
    <DocumentPane
      document={doc}
      chat={state.chat.chat}
      view={documentView}
      onViewChange={setDocumentView}
      presentation={presentation}
      publishControlsSlot={presentation === 'pane' ? publishControlsSlot : null}
      readOnly={presentation === 'drawer'}
      className={presentation === 'drawer' ? '-mx-4 -mt-2' : undefined}
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
      <AIModeHeader
        title={headerTitle}
        publishControlsRef={isBelowTablet ? undefined : setPublishControlsSlot}
        onBack={close}
      />

      <WorkspacePanes
        layout={layout}
        isBelowTablet={isBelowTablet}
        sidebarWidth={{ ...listWidth, min: LIST_MIN_WIDTH, max: LIST_MAX_WIDTH }}
        sideWidth={{ ...sideWidth, min: sideMinWidth, max: sideMaxWidth }}
        listOpen={listOpen}
        onCloseList={closeList}
        onCloseDocumentDrawer={closeDocument}
        container={rootEl}
        sidebar={<WorkspaceSidebar state={state} onNavigate={closeList} />}
        chat={
          <ChatPane
            state={state}
            onOpenConversations={() => setListOpen(true)}
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
        }
        document={showDocument ? documentPane('pane') : null}
        documentDrawer={showDocument ? documentPane('drawer') : null}
      />
    </div>,
    document.body
  );
}
