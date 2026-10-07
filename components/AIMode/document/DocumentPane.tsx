'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { AssistantActivityDot } from '@/components/AgentChat/AssistantActivityDot';
import { NoteReviewBanner } from '@/components/Notebook/NoteReview/NoteReviewBanner';
import { PublishingFormProvider } from '@/components/Notebook/PublishingForm';
import { PublishingHostProvider, type PublishingHost } from '@/contexts/PublishingHostContext';
import { useNoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { NoteReviewControls } from '@/components/Notebook/NoteReview/NoteReviewControls';
import { noteDiffPersistableDoc } from '@/components/Notebook/NoteReview/noteDiffOverlay';
import { useNoteAgentReview } from '@/components/Notebook/NoteReview/useNoteAgentReview';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { DraftBlockPreview } from './DraftBlockPreview';
import { DocumentPaneSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { useUpdateNote } from '@/hooks/useNote';
import type { AgentChat } from '@/types/agentChat';
import { cn } from '@/utils/styles';
import { Masthead } from './masthead/Masthead';
import { useMastheadSlots } from './masthead/useMastheadSlots';
import { PublishDialog } from './PublishDialog';
import { PublishPill } from './PublishPill';
import type { AIModeDocument } from './useAIModeDocument';
import { useDocumentTitle } from './useDocumentTitle';

/** The page column: shared by the skeleton and the document so they line up. */
const DOCUMENT_PAGE_CLASS =
  'ai-mode-document mx-auto w-full max-w-[860px] px-5 py-6 tablet:!px-8 tablet:!py-8';

interface DocumentPaneProps {
  readonly document: AIModeDocument;
  /** The open chat, whose activity is one of the review's version signals. */
  readonly chat: AgentChat | null;
  /** The assistant has a turn running on this document in one of its other chats. */
  readonly assistantWorking?: boolean;
  readonly className?: string;
}

/**
 * The document pane: the note the assistant is composing, in the real editor,
 * under a masthead that holds what it needs before it can be published, with
 * a Publish button floating over it. The same in the column beside the chat
 * and in the phone's drawer.
 * Each version the assistant writes is spliced into the editor as an in-note
 * review (highlighted insertions, struck removals, accept/reject), exactly as
 * in the notebook. The user can edit once the turn has settled; edits
 * autosave. While a section is being written the streaming prose is appended
 * below the editor, and a turn with no draft shows an in-progress row so the
 * page never sits frozen.
 */
export function DocumentPane({
  document,
  chat,
  assistantWorking = false,
  className,
}: DocumentPaneProps) {
  const { note, content, loading, error, status, draftText, draftBlocks, phaseLabel } = document;
  const noteId = note?.id ?? null;
  const writing = status === 'drafting' || status === 'working';

  // ---- the editor, its autosave, and the assistant-version review ----
  // The editor is held with the note it was made for. Switching documents
  // leaves the previous one in state until the next editor is up; read as
  // this note's, it would report the old document's heading as the new
  // one's title and save into the wrong note. Until then there is none.
  const [heldEditor, setHeldEditor] = useState<{
    readonly editor: Editor | null;
    readonly noteId: number | null;
  }>({ editor: null, noteId: null });
  const setEditor = useCallback(
    (instance: Editor | null) => setHeldEditor({ editor: instance, noteId }),
    [noteId]
  );
  const editor = heldEditor.noteId === noteId ? heldEditor.editor : null;
  // The details form is the notebook's own, hosted here: it reads the note,
  // the live editor and the note's single details writer through the host
  // seam rather than the notebook context.
  const { saveDetailsSoon, saveDetailsNow } = useNoteDetailsSaver(noteId ?? undefined);
  // A save whose heading changed brings the note's saved title along. The
  // title hook that does it needs this save in turn, so it is reached
  // through a ref, set where the hook is called below.
  const syncAfterSaveRef = useRef(() => {});
  const [, updateNote, saveNoteNow] = useUpdateNote(noteId ?? undefined, {
    // Mid-review the editor holds a merged document; saves must persist it
    // without the struck (pending-removal) ranges.
    docToPersist: (instance) => noteDiffPersistableDoc(instance) ?? instance.state.doc,
    saveTitle: () => syncAfterSaveRef.current(),
  });
  // Creating the editor dispatches document-changing transactions of its own
  // (UniqueID stamps ids onto the assistant's blocks, which carry none) and
  // those arrive here before the instance has even been handed over via
  // setEditor. Saving them would write an editor-authored version the user
  // never made — on a brand-new note that also makes the assistant's first
  // edit_note stale. Only updates to the editor we hold are the user's.
  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);
  // The editor came up empty for a note that has text: the content didn't
  // survive the load (a parse the schema rejected, say — tiptap falls back
  // to an empty document with only a console warning). Treat it as a failed
  // load rather than an empty document, or the first autosave would write
  // that emptiness over the real note.
  const loadedText = content?.plainText?.trim() ?? '';
  const editorLostContent =
    editor != null && loadedText.length > 0 && editor.state.doc.textContent.trim().length === 0;

  const handleEditorUpdate = useCallback(
    (instance: Editor) => {
      if (editorRef.current !== instance) return;
      // An empty document is never a save this surface should make: not on a
      // fresh note (the assistant's first edit_note would go stale), and not
      // on a written one (it would erase it). Clearing everything on purpose
      // is the notebook's job.
      if (instance.state.doc.textContent.trim().length === 0) return;
      updateNote(instance);
    },
    [updateNote]
  );

  const publishingHost = useMemo<PublishingHost>(
    () => ({
      note: content,
      editor,
      isLoading: loading,
      saveDetailsSoon,
      saveDetailsNow,
    }),
    [content, editor, loading, saveDetailsSoon, saveDetailsNow]
  );

  const persistEditorState = useCallback(async () => {
    if (!editor || editor.isDestroyed) return false;
    return saveNoteNow(editor);
  }, [editor, saveNoteNow]);

  const loadedNote = useMemo(
    () => (content && noteId != null ? { id: noteId, versionId: content.versionId } : null),
    [content, noteId]
  );
  const review = useNoteAgentReview({
    noteId,
    editor,
    loadedNote,
    chat,
    onPersistEditorState: persistEditorState,
  });

  // Editable only once the turn has settled: typing while the assistant is
  // mid-edit would make its next edit_note stale and the review jumpy.
  const locked = writing || editorLostContent;

  // The assistant is about to write the first version: nothing to show in
  // the editor yet, so the whole pane is the progress screen from the moment
  // the message is sent, even before the note has loaded.
  const startingDocument = document.starting && review.review == null;

  const reviewing = review.review != null;
  const mastheadSlots = useMastheadSlots(editor);

  // The document's one title: its first heading (see useDocumentTitle).
  const { title, syncSavedTitle, syncAfterSave, writeTitle } = useDocumentTitle({
    editor,
    savedTitle: document.title,
    showSavedTitle: document.rename,
    reportHeading: document.setHeadingTitle,
    saveDetailsSoon,
    saveNoteNow,
    locked,
    reviewing,
  });
  syncAfterSaveRef.current = syncAfterSave;
  const acceptReview = review.accept;
  const accept = useCallback(() => {
    acceptReview();
    syncSavedTitle();
  }, [acceptReview, syncSavedTitle]);

  // The bottom-centre spot is the assistant's first: while it writes, and
  // while its changes wait to be accepted or rejected, there is no Publish.
  const showPublish =
    content != null && !loading && !writing && review.review == null && !editorLostContent;

  return (
    <PublishingHostProvider value={publishingHost}>
      {/* The form lives as long as the note does, whichever view is showing:
          its values are the source of the masthead and the publish controls,
          and remounting it would rehydrate from the note as it was loaded,
          dropping edits saved since. */}
      <PublishingFormProvider
        publishTitle={title}
        publishConfirmation={<PublishDialog title={title} onRename={writeTitle} />}
        refreshedNote={document.details}
      >
        <div className={cn('relative flex h-full min-h-0 flex-col bg-white', className)}>
          {/* Above the content, so it does not scroll: the one sign of the
              assistant's work on the document, flashing and named while it
              drafts, still while its changes wait to be accepted or rejected. */}
          {(writing || assistantWorking) && (
            <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 py-1 pl-1.5 pr-2.5 text-xs font-medium text-primary-700 backdrop-blur-sm">
              <AssistantActivityDot state="working" />
              Drafting
            </span>
          )}
          {!writing && !assistantWorking && reviewing && (
            <AssistantActivityDot state="review" className="absolute right-4 top-4 z-10" />
          )}
          {/* The document is the pane: no gutter, no card, just the page. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <NoteReviewBanner review={review} className="mx-6 mt-4" />

            {error && content == null ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-gray-600">{error}</p>
                <Button variant="outlined" size="sm" onClick={document.reload}>
                  Try again
                </Button>
              </div>
            ) : startingDocument ? (
              <StartingDocument label={phaseLabel} />
            ) : loading || content == null ? (
              <div className={DOCUMENT_PAGE_CLASS}>
                <DocumentPaneSkeleton />
              </div>
            ) : (
              <article
                className={cn(
                  DOCUMENT_PAGE_CLASS,
                  'animate-in fade-in duration-300',
                  // Room for the last lines to scroll clear of the floating button.
                  '!pb-28'
                )}
              >
                <Masthead slots={mastheadSlots} />
                {editorLostContent && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    This document couldn’t be displayed here. Open it in the notebook to view it;
                    nothing has been changed.
                  </div>
                )}
                {status === 'empty' && review.review == null && <EmptyDocument />}

                {/* Mounted once per note: the editor's content prop is only read on
                creation, and later versions arrive through the review. */}
                <div className={cn(writing && !document.hasWrittenVersion && 'hidden')}>
                  <BlockEditorClientWrapper
                    key={noteId ?? 'none'}
                    content={content.content}
                    contentJson={content.contentJson}
                    editable
                    locked={locked}
                    requireTitle={false}
                    autofocus={false}
                    onUpdate={handleEditorUpdate}
                    setEditor={setEditor}
                  />
                </div>

                {status === 'drafting' && draftText && (
                  <DraftSection
                    text={draftText}
                    blocks={draftBlocks}
                    editor={editor}
                    key={document.draftKey}
                    hasSavedContent={document.hasWrittenVersion}
                  />
                )}

                {status === 'working' && document.hasWrittenVersion && (
                  <InProgressRow label={phaseLabel ?? 'Working'} />
                )}
              </article>
            )}
          </div>

          {review.review && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <NoteReviewControls
                changeCount={review.review.changeCount}
                onAccept={accept}
                onReject={review.reject}
              />
            </div>
          )}

          {showPublish && <PublishPill />}
        </div>
      </PublishingFormProvider>
    </PublishingHostProvider>
  );
}

/**
 * The assistant is writing the first version. Fills the pane: there is no
 * document to sit beside yet, so the progress state is the page.
 */
function StartingDocument({ label }: { readonly label: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center"
    >
      <Loader size="md" className="text-primary-500" />
      <p className="text-base font-semibold text-gray-800">Starting the document…</p>
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

/** The note exists, the turn has settled, and nothing was ever written. */
function EmptyDocument() {
  return (
    <div className="mb-4 flex flex-col items-center gap-2 rounded-lg bg-gray-50 px-4 py-5 text-center">
      <p className="text-sm text-gray-500">
        Nothing has been written here yet. You can start typing, or ask the assistant.
      </p>
    </div>
  );
}

/** The section being written, appended below the settled content. */
function DraftSection({
  text,
  blocks,
  editor,
  hasSavedContent,
}: {
  readonly text: string;
  readonly blocks: AIModeDocument['draftBlocks'];
  readonly editor: Editor | null;
  readonly hasSavedContent: boolean;
}) {
  return (
    <section
      aria-label="Section being written"
      className={cn(hasSavedContent && 'mt-8 border-t border-gray-100 pt-6')}
    >
      <DraftBlockPreview blocks={blocks} editor={editor} fallbackText={text} />
    </section>
  );
}

/** No draft is streaming, but a turn is running: say what it's doing. */
function InProgressRow({ label }: { readonly label: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 border-t border-dashed border-gray-200 pt-4 text-sm text-gray-500">
      <Loader size="sm" className="!h-3.5 !w-3.5 text-primary-500" />
      <span>{label}…</span>
    </div>
  );
}
