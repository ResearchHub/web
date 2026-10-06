'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { setDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import { NoteReviewBanner } from '@/components/Notebook/NoteReview/NoteReviewBanner';
import {
  PublishingForm,
  PublishingFormProvider,
  usePublishingCompletion,
} from '@/components/Notebook/PublishingForm';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
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
import { PublishControls } from './PublishControls';
import { PublishDialog } from './PublishDialog';
import { PublishPill } from './PublishPill';
import type { AIModeDocument } from './useAIModeDocument';

/** The document itself, or the full publishing details form the phone's drawer still has. */
export type DocumentPaneView = 'document' | 'details';

/** The page column: shared by the skeleton and the document so they line up. */
const DOCUMENT_PAGE_CLASS =
  'ai-mode-document mx-auto w-full max-w-[860px] px-5 py-6 tablet:!px-8 tablet:!py-8';

interface DocumentPaneProps {
  readonly document: AIModeDocument;
  /** The open chat, whose activity is one of the review's version signals. */
  readonly chat: AgentChat | null;
  /** Which of the drawer's two views is showing; the column only has the document. */
  readonly view: DocumentPaneView;
  readonly onViewChange: (view: DocumentPaneView) => void;
  /**
   * A column beside the chat, or the drawer below the tablet breakpoint. The
   * column is only the document: its publishing details head it and a
   * Publish button floats over it. The drawer has not been redesigned yet,
   * and keeps a Document | Details switch with its publish controls.
   */
  readonly presentation?: 'pane' | 'drawer';
  /** The editor is never editable — the mobile drawer. */
  readonly readOnly?: boolean;
  readonly className?: string;
}

/**
 * The document pane: the note the assistant is composing, in the real editor,
 * under a masthead that holds what it needs before it can be published.
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
  view,
  onViewChange,
  presentation = 'pane',
  readOnly = false,
  className,
}: DocumentPaneProps) {
  const { note, content, loading, error, status, draftText, draftBlocks, phaseLabel } = document;
  const noteId = note?.id ?? null;
  const writing = status === 'drafting' || status === 'working';
  const isPane = presentation === 'pane';
  // The column has no details view; a drawer left on Details must not hide it.
  const showingDocument = isPane || view === 'document';

  // ---- the editor, its autosave, and the assistant-version review ----
  const [editor, setEditor] = useState<Editor | null>(null);
  // The assistant names the note when it creates it; unlike the notebook,
  // the document's first heading is a section, not the title, so saves here
  // never derive a title from it.
  const [, updateNote, saveNoteNow] = useUpdateNote(noteId ?? undefined, {
    // Mid-review the editor holds a merged document; saves must persist it
    // without the struck (pending-removal) ranges.
    docToPersist: (instance) => noteDiffPersistableDoc(instance) ?? instance.state.doc,
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

  // The details form is the notebook's own, hosted here: it reads the note,
  // the live editor and the note's single details writer through the host
  // seam rather than the notebook context.
  const { saveDetailsSoon, saveDetailsNow } = useNoteDetailsSaver(noteId ?? undefined);
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

  // The assistant is writing the first version: nothing to show in the
  // editor yet, so the whole pane becomes the progress screen.
  const startingDocument =
    status === 'working' && !document.hasWrittenVersion && review.review == null;

  const openDetails = useCallback(() => onViewChange('details'), [onViewChange]);

  // The note's title heads the document and is what it is published under.
  // It is the note's own field, not the document's first heading, which here
  // is a section; it saves through the note's details writer.
  const title = document.title;

  // A draft made in the notebook is the exception: its body opens with the
  // title as a top-level heading, which is where the notebook reads the
  // title from. The masthead already shows it and the published page drops
  // that heading, so it is hidden here, and a rename is written into it too
  // so the two cannot drift apart.
  const [leadingHeading, setLeadingHeading] = useState<string | null>(null);
  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      setLeadingHeading(null);
      return undefined;
    }
    const read = () => {
      const first = editor.state.doc.firstChild;
      const isTitleHeading = first?.type.name === 'heading' && first.attrs.level === 1;
      setLeadingHeading(isTitleHeading ? first.textContent.trim() : null);
    };
    read();
    editor.on('update', read);
    return () => {
      editor.off('update', read);
    };
  }, [editor]);
  const bodyOpensWithTitle = title !== '' && leadingHeading === title;
  const reviewing = review.review != null;

  const renameDocument = document.rename;
  const rename = useCallback(
    (next: string) => {
      renameDocument(next);
      // Not under the assistant's hands: a write there would make its edit stale.
      const writeHeading =
        bodyOpensWithTitle && editor != null && !editor.isDestroyed && !locked && !reviewing;
      if (!writeHeading) {
        saveDetailsSoon({ title: next });
        return;
      }
      // The document goes out first and the title only once it has landed.
      // The API takes them on separate routes, and a title that arrives
      // while a version is being written leaves the note pointing at the
      // version before it.
      setDocumentTitle(editor, next);
      void saveNoteNow(editor).finally(() => saveDetailsSoon({ title: next }));
    },
    [bodyOpensWithTitle, editor, locked, reviewing, renameDocument, saveDetailsSoon, saveNoteNow]
  );

  // The bottom-centre spot is the assistant's first: while it writes, and
  // while its changes wait to be accepted or rejected, there is no Publish.
  const showPublish =
    isPane &&
    content != null &&
    !loading &&
    !writing &&
    review.review == null &&
    !editorLostContent;

  return (
    <PublishingHostProvider value={publishingHost}>
      {/* The form lives as long as the note does, whichever view is showing:
          its values are the source of the masthead and the publish controls,
          and remounting it would rehydrate from the note as it was loaded,
          dropping edits saved since. */}
      <PublishingFormProvider
        publishTitle={title}
        publishConfirmation={isPane ? <PublishDialog title={title} onRename={rename} /> : undefined}
      >
        <div className={cn('relative flex h-full min-h-0 flex-col bg-white', className)}>
          {!isPane && (
            <DrawerStrip view={view} onViewChange={onViewChange} onOpenDetails={openDetails} />
          )}

          {/* The document is the pane: no gutter, no card, just the page. The
          editor stays mounted behind the drawer's details view — it holds the
          review and autosave state, and the form publishes from it. */}
          <div className={cn('min-h-0 flex-1 overflow-y-auto', !showingDocument && 'hidden')}>
            <NoteReviewBanner review={review} className="mx-6 mt-4" />

            {error && content == null ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-sm text-gray-600">{error}</p>
                <Button variant="outlined" size="sm" onClick={document.reload}>
                  Try again
                </Button>
              </div>
            ) : loading || content == null ? (
              <div className={DOCUMENT_PAGE_CLASS}>
                <DocumentPaneSkeleton />
              </div>
            ) : startingDocument ? (
              <StartingDocument label={phaseLabel} />
            ) : (
              <article
                className={cn(
                  DOCUMENT_PAGE_CLASS,
                  'animate-in fade-in duration-300',
                  // Room for the last lines to scroll clear of the floating button.
                  isPane && '!pb-28'
                )}
              >
                <Masthead title={title} onRename={rename} readOnly={!isPane} />
                {editorLostContent && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    This document couldn’t be displayed here. Open it in the notebook to view it;
                    nothing has been changed.
                  </div>
                )}
                {status === 'empty' && review.review == null && <EmptyDocument />}

                {/* Mounted once per note: the editor's content prop is only read on
                creation, and later versions arrive through the review. */}
                <div
                  className={cn(
                    writing && !document.hasWrittenVersion && 'hidden',
                    bodyOpensWithTitle && '[&_.ProseMirror>h1:first-of-type]:hidden'
                  )}
                >
                  <BlockEditorClientWrapper
                    key={noteId ?? 'none'}
                    content={content.content}
                    contentJson={content.contentJson}
                    editable={!readOnly}
                    locked={locked}
                    requireTitle={false}
                    autofocus={false}
                    onUpdate={readOnly ? undefined : handleEditorUpdate}
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

          {/* The drawer's full form, mounted only while showing: two inputs
              registered on one field leave the form reading and writing
              through whichever attached last, and keystrokes go missing. The
              masthead beside it is read-only there for the same reason. The
              values live in the provider, so nothing is lost by unmounting. */}
          {!isPane && view === 'details' && (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <PublishingForm showFooter={false} />
            </div>
          )}

          {review.review && showingDocument && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <NoteReviewControls
                changeCount={review.review.changeCount}
                onAccept={review.accept}
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
 * The drawer's top row: a Document | Details switch, with how many required
 * details are left on the Details side, and the publish controls.
 */
function DrawerStrip({
  view,
  onViewChange,
  onOpenDetails,
}: {
  readonly view: DocumentPaneView;
  readonly onViewChange: (view: DocumentPaneView) => void;
  readonly onOpenDetails: () => void;
}) {
  const { remaining } = usePublishingCompletion();
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
      <ButtonGroup
        size="sm"
        value={view}
        onChange={(next) => onViewChange(next as DocumentPaneView)}
        options={[
          { value: 'document', label: 'Document' },
          { value: 'details', label: 'Details', badge: remaining || undefined },
        ]}
      />
      <PublishControls onOpenDetails={onOpenDetails} />
    </div>
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
      <div role="status" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Loader size="sm" className="!h-3 !w-3 text-primary-500" />
        <span>Drafting</span>
      </div>
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
