'use client';

import { useCallback, useEffect, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { isActiveExecutionStatus } from '@/types/agentChat';
import { isPublishedNote, isRfpNote } from '@/types/note';
import { cn } from '@/utils/styles';
import { AIModeProvider } from './AIModeContext';
import { ChatPane } from './chat/ChatPane';
import { newDraftTitle } from './copy';
import { DocumentPane } from './document/DocumentPane';
import { useAIModeDocument } from './document/useAIModeDocument';
import { WorkspacePanes } from './shell/WorkspacePanes';
import { WorkspaceTopBar } from './shell/WorkspaceTopBar';
import { useAIModeChat } from './useAIModeChat';

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
 * The `/workspace` page: the app's shell, with the chat and, beside it on
 * the right, the document it is about. The user's documents are in the
 * app's left sidebar, as on every page. What it is open on lives in the URL.
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
  const { target, note } = state;

  // From Tailwind's `sidebar-compact` up the app's left column is there and
  // the top bar has room for a document's title.
  const isWide = useMediaQuery('(min-width: 1240px)') === true;
  // Tailwind's `tablet` breakpoint; the side-by-side panes only exist from it up.
  const phoneQuery = useMediaQuery('(max-width: 767px)');
  const isBelowTablet = phoneQuery === true;

  const latestExecution = state.chat.latestExecution;
  const turnActive = latestExecution != null && isActiveExecutionStatus(latestExecution.status);
  const doc = useAIModeDocument({
    note,
    chat: state.chat.chat,
    latestExecution,
    assistantWorking: turnActive || state.anyTurnActive,
    messagePending: state.messagePending,
  });

  // ---- the document's width: it drags, the chat takes the rest ----
  const [panesEl, setPanesEl] = useState<HTMLDivElement | null>(null);
  const panesWidth = useElementWidth(panesEl);
  const documentMaxWidth = Math.max(DOCUMENT_MIN_WIDTH, panesWidth - CHAT_MIN_WIDTH);
  const documentWidth = useResizableWidth({
    storageKey: 'ai-mode:document-width',
    min: DOCUMENT_MIN_WIDTH,
    max: documentMaxWidth,
    defaultWidth: (width) => width * DOCUMENT_DEFAULT_SHARE,
    anchor: 'right',
  });

  // On desktop the document shows beside its chat as soon as it is open; on
  // a phone the chat header's toggle opens it in a drawer. Either way the
  // user can hide it and bring it back from there; that choice holds for
  // the document it was made on. Until the width is known, nothing opens.
  const noteId = note?.id ?? null;
  const [documentChoice, setDocumentChoice] = useState<{
    readonly noteId: number;
    readonly open: boolean;
  } | null>(null);
  const documentOpen =
    documentChoice != null && documentChoice.noteId === noteId
      ? documentChoice.open
      : phoneQuery === false;
  const setDocumentOpen = useCallback(
    (open: boolean) => {
      if (noteId != null) setDocumentChoice({ noteId, open });
    },
    [noteId]
  );
  const closeDocument = useCallback(() => setDocumentOpen(false), [setDocumentOpen]);
  const showDocument = noteId != null && documentOpen && !doc.missing;

  // The sidebar's row follows the open document: a rename in the masthead,
  // a name the assistant gave it, the latest edit.
  const { patch } = useFundingDocuments();
  const { title: docTitle, updatedDate: docUpdatedDate } = doc;
  useEffect(() => {
    if (noteId == null || !docTitle) return;
    patch(
      noteId,
      docUpdatedDate ? { title: docTitle, updatedDate: docUpdatedDate } : { title: docTitle }
    );
  }, [noteId, docTitle, docUpdatedDate, patch]);

  // The top bar names what is open: on the start screen what it will
  // produce — an RFP or a proposal — and on a document its title, or below
  // the width at which a title stays readable just whether it is out yet.
  const loadedNote = doc.details ?? doc.content;
  const headerTitle =
    target.kind === 'new'
      ? newDraftTitle(state.intent)
      : !isWide
        ? isPublishedNote(loadedNote)
          ? 'Published'
          : 'Draft'
        : doc.title || 'Untitled';

  const documentPane = (inDrawer: boolean) => (
    <DocumentPane
      document={doc}
      chat={state.chat.chat}
      assistantWorking={state.anyTurnActive}
      className={inDrawer ? '-mx-4 -mt-2' : undefined}
    />
  );

  return (
    <PageLayout fullBleed>
      <div ref={setPanesEl} className="workspace-fade-in flex min-h-0 flex-1 flex-col bg-gray-50">
        <WorkspaceTopBar title={headerTitle} />

        <WorkspacePanes
          isBelowTablet={isBelowTablet}
          documentWidth={{ ...documentWidth, min: DOCUMENT_MIN_WIDTH, max: documentMaxWidth }}
          onCloseDocumentDrawer={closeDocument}
          chat={
            <ChatPane
              state={state}
              documentIsRfp={isRfpNote(doc.content)}
              documentIsEmpty={doc.status === 'empty'}
              documentMissing={doc.missing}
              headerActions={
                noteId != null && (
                  <button
                    type="button"
                    onClick={() => setDocumentOpen(!showDocument)}
                    aria-pressed={showDocument}
                    aria-label={showDocument ? 'Hide document' : 'Show document'}
                    title={showDocument ? 'Hide document' : 'Show document'}
                    className={cn(
                      'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg transition-colors',
                      showDocument
                        ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    {/* The chevron points where the document goes: away to the
                        right while it shows, in from the right while hidden. */}
                    {showDocument ? (
                      <PanelRightClose className="h-[18px] w-[18px]" aria-hidden="true" />
                    ) : (
                      <PanelRightOpen className="h-[18px] w-[18px]" aria-hidden="true" />
                    )}
                  </button>
                )
              }
            />
          }
          document={showDocument ? documentPane(false) : null}
          documentDrawer={showDocument ? documentPane(true) : null}
        />
      </div>
    </PageLayout>
  );
}
