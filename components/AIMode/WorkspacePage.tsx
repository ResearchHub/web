'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelRightOpen } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { cn } from '@/utils/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { AIModeProvider } from './AIModeContext';
import { ChatPane } from './chat/ChatPane';
import { DocumentCard } from './chat/DocumentCard';
import { conversationTitleFor } from './chat/conversationTitle';
import { DocumentPane, type DocumentPaneView } from './document/DocumentPane';
import { useAIModeDocument } from './document/useAIModeDocument';
import { WorkspacePanes } from './shell/WorkspacePanes';
import { WorkspaceTopBar } from './shell/WorkspaceTopBar';
import { WorkspaceSidebar } from './sidebar/WorkspaceSidebar';
import { useAIModeChat } from './useAIModeChat';
import { newConversationTitle } from './copy';
import { layoutFor } from './workspaceUrl';

const CHAT_MIN_WIDTH = 360;
const DOCUMENT_MIN_WIDTH = 420;
/** Share of the viewport the document opens at before the user drags it. */
const DOCUMENT_DEFAULT_SHARE = 0.55;

/** An element's width as it resizes; the viewport's until it has mounted. */
function useElementWidth(element: HTMLElement | null): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  );
  useEffect(() => {
    if (!element) return;
    const update = () => setWidth(Math.round(element.getBoundingClientRect().width));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return width;
}

/**
 * The `/workspace` page: the app's shell with the user's conversations and
 * drafts in the left column where the nav items normally are, and the chat
 * and the document filling the rest. What it is open on lives in the URL.
 */
export function WorkspacePage() {
  return (
    <AIModeProvider>
      <Workspace />
    </AIModeProvider>
  );
}

function Workspace() {
  const state = useAIModeChat();
  const { target } = state;
  // A document opened from the sidebar comes first; a conversation's document sits beside it.
  const layout = layoutFor(target);

  // The lists sit in the app's left column from the width at which it stops
  // being an icon rail (Tailwind's `sidebar-compact`). Below that they wait
  // behind a button: a panel over the panes, or on a phone a screen of their own.
  const listsInColumn = useMediaQuery('(min-width: 1240px)') === true;
  // Tailwind's `tablet` breakpoint; the side-by-side panes only exist from it up.
  const isBelowTablet = useMediaQuery('(max-width: 767px)') === true;
  const [listOpen, setListOpen] = useState(false);
  const closeList = useCallback(() => setListOpen(false), []);
  const toggleList = useCallback(() => setListOpen((open) => !open), []);
  useEffect(() => {
    if (listsInColumn) setListOpen(false);
  }, [listsInColumn]);

  const doc = useAIModeDocument({
    note: state.note,
    chat: state.chat.chat,
    latestExecution: state.chat.latestExecution,
  });

  // ---- pane widths: the side pane drags, the main pane takes the rest ----
  const [panesEl, setPanesEl] = useState<HTMLDivElement | null>(null);
  const panesWidth = useElementWidth(panesEl);
  // Document or details in the phone's drawer; the column only shows the document.
  const [documentView, setDocumentView] = useState<DocumentPaneView>('document');
  // The side pane is the document (chat first) or the chat (document first);
  // it may grow until the main pane is down to its own minimum column.
  const sideIsDocument = layout === 'chat';
  const sideMinWidth = sideIsDocument ? DOCUMENT_MIN_WIDTH : CHAT_MIN_WIDTH;
  const sideMaxWidth = Math.max(
    sideMinWidth,
    panesWidth - (sideIsDocument ? CHAT_MIN_WIDTH : DOCUMENT_MIN_WIDTH)
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
  // The Drafts list follows the open document's title as it is renamed.
  const docTitle = doc.title;
  const openNote = useMemo(
    () => (noteId != null && docTitle ? { id: noteId, title: docTitle } : null),
    [noteId, docTitle]
  );
  const documentTitle = doc.title || 'Document';
  // The top bar names what is open: the conversation when the chat is the
  // main pane, the document when it is, and the new-conversation screen by
  // what it is for — an RFP or a proposal.
  const { title: conversationTitle } = conversationTitleFor(state);
  const headerTitle =
    layout === 'document'
      ? documentTitle
      : target.chatId != null
        ? conversationTitle
        : newConversationTitle(state.intent);

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

  const documentPane = (presentation: 'pane' | 'drawer') => (
    <DocumentPane
      document={doc}
      chat={state.chat.chat}
      view={documentView}
      onViewChange={setDocumentView}
      presentation={presentation}
      readOnly={presentation === 'drawer'}
      className={presentation === 'drawer' ? '-mx-4 -mt-2' : undefined}
    />
  );

  return (
    <PageLayout
      fullBleed
      leftSidebarContent={
        listsInColumn ? (
          <div className="workspace-fade-in h-full">
            <WorkspaceSidebar state={state} openNote={openNote} />
          </div>
        ) : null
      }
    >
      <div ref={setPanesEl} className="workspace-fade-in flex min-h-0 flex-1 flex-col bg-gray-50">
        <WorkspaceTopBar
          title={headerTitle}
          listOpen={listOpen}
          onToggleList={listsInColumn || isBelowTablet ? undefined : toggleList}
        />

        <WorkspacePanes
          layout={layout}
          isBelowTablet={isBelowTablet}
          sideWidth={{ ...sideWidth, min: sideMinWidth, max: sideMaxWidth }}
          lists={
            listsInColumn ? null : (
              <WorkspaceSidebar state={state} openNote={openNote} onNavigate={closeList} />
            )
          }
          listOpen={listOpen}
          onCloseList={closeList}
          onCloseDocumentDrawer={closeDocument}
          chat={
            <ChatPane
              state={state}
              // The top bar names the chat when it is the main pane.
              showTitle={layout !== 'chat'}
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
                    <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
                  </button>
                )
              }
            />
          }
          document={showDocument ? documentPane('pane') : null}
          documentDrawer={showDocument ? documentPane('drawer') : null}
        />
      </div>
    </PageLayout>
  );
}
