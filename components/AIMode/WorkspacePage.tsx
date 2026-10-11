'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { DraftMenu } from '@/components/Funding/DraftMenu';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { isActiveExecutionStatus } from '@/types/agentChat';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { isPublishedNote } from '@/types/note';
import { AIModeProvider, useAIMode } from './AIModeContext';
import { ChatPane } from './chat/ChatPane';
import { newDraftTitle } from './copy';
import { DocumentPane } from './document/DocumentPane';
import { useAIModeDocument, type AIModeDocument } from './document/useAIModeDocument';
import { ViewSwitch } from './shell/ViewSwitch';
import { WorkspacePanes } from './shell/WorkspacePanes';
import { WorkspaceTopBar } from './shell/WorkspaceTopBar';
import { useWorkspaceView, type WorkspaceView } from './shell/workspaceView';
import { useAIModeChat } from './useAIModeChat';

const CHAT_MIN_WIDTH = 360;
const DOCUMENT_MIN_WIDTH = 420;
/** Share of the viewport the document opens at before the user drags it. */
const DOCUMENT_DEFAULT_SHARE = 0.55;

const WIDE_VIEWS: readonly WorkspaceView[] = ['chat', 'split', 'document'];
const PHONE_VIEWS: readonly WorkspaceView[] = ['chat', 'document'];

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
 * What the top bar names: on the start screen what it will produce (an RFP
 * or a proposal), and on a document its title as the document heads it, or,
 * below the width at which a title stays readable, just whether it is out
 * yet. '' is the bar's loading state: shown until the note has loaded, so
 * nothing stands in for the real title first.
 */
function topBarTitle({
  startingIntent,
  doc,
  isWide,
}: {
  readonly startingIntent: FundingIntent | null;
  readonly doc: AIModeDocument;
  readonly isWide: boolean;
}): string {
  if (startingIntent) return newDraftTitle(startingIntent);
  const loadedNote = doc.details ?? doc.content;
  if (doc.missing || (doc.error != null && loadedNote == null)) return 'Untitled';
  if (loadedNote == null) return '';
  if (!isWide) return isPublishedNote(loadedNote) ? 'Published' : 'Draft';
  return doc.displayTitle ?? '';
}

/**
 * The `/workspace` page: the app's shell, with the chat and, beside it on
 * the right, the document it is about, or either one alone, as the top
 * bar's view switch says. The user's documents are in the app's left
 * sidebar, as on every page. What it is open on lives in the URL.
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

  // The sidebar marks the open document's row while the assistant works on
  // it, as the document's own dot does.
  const { setWorkingNoteId } = useAIMode();
  const workingNoteId =
    note != null && (doc.status === 'drafting' || doc.status === 'working' || state.anyTurnActive)
      ? note.id
      : null;
  useEffect(() => {
    setWorkingNoteId(workingNoteId);
  }, [workingNoteId, setWorkingNoteId]);
  useEffect(() => () => setWorkingNoteId(null), [setWorkingNoteId]);

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

  // ---- what shows: the chat, the document, or both ----
  // Chosen in the top bar and remembered per document. A document with no
  // chats is being written by hand, so it opens on its own. A phone has room
  // for one at a time: Split shows there as the chat, and Chat from the
  // document view asks for Split, so a wide screen still shows both.
  const noteId = note?.id ?? null;
  const { list, listReady } = state;
  const hasChats =
    listReady && list.access === 'ok'
      ? list.chats.length > 0
      : listReady && list.access === 'hidden'
        ? false
        : null;
  const [view, setView] = useWorkspaceView(noteId, hasChats);
  // Until the width is known, the phone's way: one pane.
  const narrow = phoneQuery !== false;
  const shownView: WorkspaceView = narrow && view === 'split' ? 'chat' : view;
  const showSwitch = noteId != null && !doc.missing;
  const chooseView = useCallback(
    (next: WorkspaceView) => setView(narrow && next === 'chat' && view !== 'chat' ? 'split' : next),
    [narrow, setView, view]
  );
  const viewSwitch = useMemo(
    () =>
      showSwitch ? (
        <ViewSwitch
          views={narrow ? PHONE_VIEWS : WIDE_VIEWS}
          value={shownView}
          onChange={chooseView}
        />
      ) : null,
    [showSwitch, narrow, shownView, chooseView]
  );

  // The sidebar's row follows the open document's saved title (its heading
  // once that has saved, or a name the assistant gave it) and latest edit.
  const { patch, drafts } = useFundingDocuments();
  const { title: docTitle, updatedDate: docUpdatedDate } = doc;
  useEffect(() => {
    if (noteId == null || !docTitle) return;
    patch(
      noteId,
      docUpdatedDate ? { title: docTitle, updatedDate: docUpdatedDate } : { title: docTitle }
    );
  }, [noteId, docTitle, docUpdatedDate, patch]);

  const headerTitle = topBarTitle({
    startingIntent: target.kind === 'new' ? state.intent : null,
    doc,
    isWide,
  });

  // An open draft can be deleted from the ⋯ at the document's corner. Held
  // stable, so the pane is not handed a new menu on every render while a
  // chat streams.
  const isDraft = noteId != null && drafts.some((draft) => draft.id === noteId);
  const draftTitle = docTitle?.trim() || 'Untitled';
  const draftMenu = useMemo(
    () =>
      isDraft && noteId != null ? (
        <DraftMenu
          noteId={noteId}
          title={draftTitle}
          isOpen
          align="end"
          triggerClassName="h-8 w-8 bg-white/90 backdrop-blur-sm"
        />
      ) : null,
    [isDraft, noteId, draftTitle]
  );

  return (
    <PageLayout fullBleed>
      <div ref={setPanesEl} className="workspace-fade-in flex min-h-0 flex-1 flex-col bg-gray-50">
        {/* On a phone the switch takes the title's place. */}
        <WorkspaceTopBar
          title={headerTitle}
          end={isBelowTablet ? null : viewSwitch}
          inPlaceOfTitle={isBelowTablet ? viewSwitch : null}
        />

        <WorkspacePanes
          view={shownView}
          documentWidth={{ ...documentWidth, min: DOCUMENT_MIN_WIDTH, max: documentMaxWidth }}
          chat={<ChatPane state={state} documentMissing={doc.missing} />}
          document={
            showSwitch ? (
              <DocumentPane
                document={doc}
                chat={state.chat.chat}
                assistantWorking={state.anyTurnActive}
                hasChats={hasChats === true}
                menu={draftMenu}
              />
            ) : null
          }
        />
      </div>
    </PageLayout>
  );
}
