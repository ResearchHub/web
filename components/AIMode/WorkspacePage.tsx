'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DraftMenu } from '@/components/Funding/DraftMenu';
import { useFundingNotes } from '@/contexts/FundingNotesContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResizableWidth } from '@/hooks/useResizableWidth';
import { isActiveExecutionStatus, type AgentChat, type ChatExecution } from '@/types/agentChat';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import type { UseAgentChatListResult } from '@/hooks/useAgentChat';
import { isPublishedNote, type Note } from '@/types/note';
import { useAIMode } from './AIModeContext';
import { ChatPane, chatPaneContent } from './chat/ChatPane';
import { DocumentCard } from './chat/DocumentCard';
import { newDraftTitle } from './copy';
import { DocumentPane } from './document/DocumentPane';
import { PublishAction, type PublishRequestOutcome } from './document/PublishPill';
import { useAIModeDocument, type AIModeDocument } from './document/useAIModeDocument';
import { usePaneReveal } from './shell/usePaneReveal';
import { ViewSwitch } from './shell/ViewSwitch';
import { WorkspacePanes } from './shell/WorkspacePanes';
import { WorkspaceTopBar } from './shell/WorkspaceTopBar';
import { useWorkspaceView, type WorkspaceView } from './shell/workspaceView';
import { useAIModeChat } from './useAIModeChat';
import type { WorkspaceTarget } from './workspaceUrl';

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
 * The turn the document's card sits under: the one writing into it right
 * now, else the newest that wrote a version of it. Null while no turn in
 * the chat has touched it.
 */
function documentCardExecutionId(
  chat: AgentChat | null,
  drafting: ChatExecution | null
): number | null {
  if (drafting) return drafting.id;
  const executions = chat?.executions ?? [];
  for (let index = executions.length - 1; index >= 0; index -= 1) {
    const wrote = (executions[index].activity ?? []).some(
      (item) =>
        item.type === 'tool_call' && item.status === 'succeeded' && item.note_version_id != null
    );
    if (wrote) return executions[index].id;
  }
  return null;
}

/**
 * What the top bar names: on the start screen what it will produce (an RFP
 * or a proposal), and on a document its title as the document heads it, or,
 * below the width at which a title stays readable, just whether it is out
 * yet. Until the document has arrived in its panes the bar names it only
 * with what will not change once it has (see `titleWhileOpening`), so the
 * title is never replaced by another as it does.
 */
function topBarTitle({
  startingIntent,
  doc,
  arrived,
  listed,
  shownTitle,
  isWide,
}: {
  readonly startingIntent: FundingIntent | null;
  readonly doc: AIModeDocument;
  /** The document has loaded and shows in its panes. */
  readonly arrived: boolean;
  readonly listed: ListedDocument | null;
  /** The title the bar showed for the document when it was last open here. */
  readonly shownTitle: string | undefined;
  readonly isWide: boolean;
}): string {
  if (startingIntent) return newDraftTitle(startingIntent);
  const loadedNote = doc.details ?? doc.content;
  if (doc.missing || (doc.error != null && loadedNote == null)) return 'Untitled';
  if (loadedNote == null || !arrived) return titleWhileOpening(listed, shownTitle, isWide);
  if (!isWide) return isPublishedNote(loadedNote) ? 'Published' : 'Draft';
  return doc.displayTitle ?? '';
}

/**
 * The bar's title while a document opens. Below the width for a title,
 * whether it is out yet, which its row in the sidebar's listing says. Wider,
 * the title it showed when the document was last open here: not the row's
 * own title, which is the saved one and can differ from the heading the bar
 * names it by (the assistant may have named the note apart from the heading
 * it wrote). '' is the bar's loading state, when neither is known.
 */
function titleWhileOpening(
  listed: ListedDocument | null,
  shownTitle: string | undefined,
  isWide: boolean
): string {
  if (isWide) return shownTitle ?? '';
  if (listed == null) return '';
  return listed.isDraft ? 'Draft' : 'Published';
}

/** The title the top bar showed for each document opened in this page session. */
const shownTitles = new Map<number, string>();

/**
 * The title the top bar showed for the open document when it was last open
 * here, kept up to date while it is: opened again, it is named from the click.
 */
function useShownTitle(noteId: number | null, title: string | null, arrived: boolean) {
  useEffect(() => {
    if (noteId != null && arrived && title) shownTitles.set(noteId, title);
  }, [noteId, arrived, title]);
  return noteId == null ? undefined : shownTitles.get(noteId);
}

/** The open document's row in the sidebar's listing, and which of its sections it is in. */
interface ListedDocument {
  readonly note: Note;
  readonly isDraft: boolean;
}

function listedDocument(
  noteId: number | null,
  drafts: readonly Note[],
  published: readonly Note[]
): ListedDocument | null {
  if (noteId == null) return null;
  const draft = drafts.find((item) => item.id === noteId);
  if (draft) return { note: draft, isDraft: true };
  const publishedNote = published.find((item) => item.id === noteId);
  return publishedNote ? { note: publishedNote, isDraft: false } : null;
}

/**
 * Whether the open document has chats, or null while nothing says. Its chat
 * listing, once loaded; until then, a chat the address names is one it has,
 * and its row in the sidebar's listing says whether it has any.
 */
function documentHasChats({
  list,
  listReady,
  target,
  listed,
}: {
  readonly list: UseAgentChatListResult;
  readonly listReady: boolean;
  readonly target: WorkspaceTarget;
  readonly listed: ListedDocument | null;
}): boolean | null {
  if (listReady && list.access === 'ok') return list.chats.length > 0;
  if (listReady && list.access === 'hidden') return false;
  if (target.kind === 'document' && typeof target.chat === 'number') return true;
  const latestChatId = listed?.note.latestChatId;
  if (latestChatId === undefined) return null;
  return latestChatId != null;
}

/**
 * The `/workspace` page's area beside the app's sidebar: the chat and,
 * beside it on the right, the document it is about, or either one alone, as
 * the top bar's view switch says. The user's documents are in the sidebar,
 * as on every page. What it is open on lives in the URL, read by the
 * `AIModeProvider` the page puts above its shell.
 */
export function WorkspacePage() {
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

  // The open document's row in the sidebar's listing, which has what the
  // page needs to know about it before the document itself has loaded.
  const noteId = note?.id ?? null;
  const { patch, drafts, published: publishedNotes } = useFundingNotes();
  const listed = listedDocument(noteId, drafts, publishedNotes);

  // ---- what shows: the chat, the document, or both ----
  // Chosen in the top bar and remembered per document. A document with no
  // chats is being written by hand, so it opens on its own. A phone has room
  // for one at a time: Split shows there as the chat, and Chat from the
  // document view asks for Split, so a wide screen still shows both.
  // Known before its chats have loaded where it can be, so the view is the
  // right one from the click rather than changing under the user once they load.
  const hasChats = documentHasChats({
    list: state.list,
    listReady: state.listReady,
    target,
    listed,
  });
  const [view, setView, viewSettled] = useWorkspaceView(noteId, hasChats);
  // Until the width is known, the phone's way: one pane.
  const narrow = phoneQuery !== false;
  const shownView: WorkspaceView = narrow && view === 'split' ? 'chat' : view;
  const showSwitch = noteId != null && !doc.missing;
  const chooseView = useCallback(
    (next: WorkspaceView) => setView(narrow && next === 'chat' && view !== 'chat' ? 'split' : next),
    [narrow, setView, view]
  );
  // Out of sight, the document is reached from its card in the chat, which
  // brings it into view: on its own on a phone, beside the chat on a wide
  // screen. It is published from the top bar, over the chat.
  const documentHidden = showSwitch && shownView === 'chat';
  const openDocument = useCallback(() => setView(narrow ? 'document' : 'split'), [narrow, setView]);
  const viewSwitch = useMemo(
    () =>
      showSwitch ? (
        <ViewSwitch
          views={narrow ? PHONE_VIEWS : WIDE_VIEWS}
          value={shownView}
          onChange={chooseView}
          // A phone's bar holds the menu, the logo, Publish and the account
          // too: no room for the views' names.
          compact={isBelowTablet}
        />
      ) : null,
    [showSwitch, narrow, shownView, chooseView, isBelowTablet]
  );

  // ---- the panes arrive together ----
  // A document opens with the panes on their skeletons, and they show what
  // they have loaded in the same frame once both have it and the view is
  // known, rather than one, then the other, then the page rearranging
  // around them. The document reports when its editor is up.
  const panes = usePaneReveal({
    noteId,
    view: shownView,
    hasDocument: showSwitch,
    settled: viewSettled,
    chatReady: chatPaneContent(state, doc.missing) !== 'loading',
  });

  // The sidebar's row follows the open document's saved title (its heading
  // once that has saved, or a name the assistant gave it) and latest edit.
  const { title: docTitle, updatedDate: docUpdatedDate } = doc;
  useEffect(() => {
    if (noteId == null || !docTitle) return;
    patch(
      noteId,
      docUpdatedDate ? { title: docTitle, updatedDate: docUpdatedDate } : { title: docTitle }
    );
  }, [noteId, docTitle, docUpdatedDate, patch]);

  // ---- Publish, while the document is out of sight ----
  // The document stays loaded, hidden, in Chat view, and the publish dialog
  // is its own: the top bar's button asks it to open that dialog over the
  // chat. When the document is in the way (the assistant's changes wait to
  // be accepted or rejected), the document comes into view instead.
  const loadedNote = doc.details ?? doc.content;
  const published = loadedNote != null && isPublishedNote(loadedNote);
  const writing = doc.status === 'drafting' || doc.status === 'working';
  // Held with the document it was for, so it never carries over to another.
  const [publishRequestedFor, setPublishRequestedFor] = useState<number | null>(null);
  const publishRequested = publishRequestedFor != null && publishRequestedFor === noteId;
  const requestPublish = useCallback(() => setPublishRequestedFor(noteId), [noteId]);
  const handlePublishRequest = useCallback(
    (outcome: PublishRequestOutcome) => {
      setPublishRequestedFor(null);
      if (outcome === 'blocked') openDocument();
    },
    [openDocument]
  );
  const publishButton = useMemo(
    () =>
      documentHidden ? (
        <PublishAction
          label={published ? 'Update' : 'Publish'}
          busy={false}
          // Not while the assistant writes: the document would only say to wait.
          disabled={loadedNote == null || writing}
          onClick={requestPublish}
          size="sm"
          testId="workspace-topbar-publish"
          className={isBelowTablet ? 'h-8 gap-1.5 pl-3 pr-3.5 text-[13px]' : undefined}
        />
      ) : null,
    [documentHidden, published, loadedNote, writing, requestPublish, isBelowTablet]
  );
  const topBarEnd = useMemo(
    () =>
      isBelowTablet ? (
        publishButton
      ) : (
        <div className="flex items-center gap-3">
          {publishButton}
          {viewSwitch}
        </div>
      ),
    [isBelowTablet, publishButton, viewSwitch]
  );

  // ---- the document's card in the chat, while the document is out of sight ----
  const cardExecutionId = documentHidden
    ? documentCardExecutionId(state.chat.chat, doc.status === 'drafting' ? latestExecution : null)
    : null;
  const cardTitle = doc.displayTitle ?? (doc.title || 'Untitled');
  const cardWriting =
    turnActive && cardExecutionId != null && cardExecutionId === latestExecution?.id
      ? doc.status === 'drafting'
        ? 'drafting'
        : 'working'
      : null;
  const renderDocumentCard = useCallback(
    (execution: ChatExecution) =>
      execution.id === cardExecutionId ? (
        <DocumentCard
          title={cardTitle}
          published={published}
          writing={cardWriting}
          onOpen={openDocument}
        />
      ) : null,
    [cardExecutionId, cardTitle, published, cardWriting, openDocument]
  );

  const shownTitle = useShownTitle(noteId, doc.displayTitle, panes.revealed);
  const headerTitle = topBarTitle({
    startingIntent: target.kind === 'new' ? state.intent : null,
    doc,
    arrived: panes.revealed,
    listed,
    shownTitle,
    isWide,
  });

  // An open draft can be deleted from the ⋯ at the document's corner. Held
  // stable, so the pane is not handed a new menu on every render while a
  // chat streams.
  const isDraft = listed?.isDraft === true;
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
    <div ref={setPanesEl} className="workspace-fade-in flex min-h-0 flex-1 flex-col bg-gray-50">
      {/* On a phone the switch takes the title's place. */}
      <WorkspaceTopBar
        title={headerTitle}
        end={topBarEnd}
        inPlaceOfTitle={isBelowTablet ? viewSwitch : null}
      />

      <WorkspacePanes
        view={shownView}
        documentWidth={{ ...documentWidth, min: DOCUMENT_MIN_WIDTH, max: documentMaxWidth }}
        chat={
          <ChatPane
            state={state}
            documentMissing={doc.missing}
            held={!panes.revealed}
            renderExecutionExtra={renderDocumentCard}
          />
        }
        document={
          showSwitch ? (
            <DocumentPane
              document={doc}
              chat={state.chat.chat}
              assistantWorking={state.anyTurnActive}
              hasChats={hasChats === true}
              menu={draftMenu}
              held={!panes.revealed}
              onReady={panes.setDocumentReady}
              publishRequested={publishRequested}
              onPublishRequestHandled={handlePublishRequest}
            />
          ) : null
        }
      />
    </div>
  );
}
