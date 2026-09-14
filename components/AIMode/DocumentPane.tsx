'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ExternalLink } from 'lucide-react';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { NoteReviewBanner } from '@/components/Notebook/NoteReview/NoteReviewBanner';
import { NotebookTabs, type NotebookTab } from '@/components/Notebook/NotebookTabs';
import { PublishingForm } from '@/components/Notebook/PublishingForm';
import {
  PublishingHostProvider,
  type PublishingDefaultArticleType,
  type PublishingHost,
} from '@/contexts/PublishingHostContext';
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
import type { AIModeDocument } from './useAIModeDocument';

/** The page column: shared by the skeleton and the document so they line up. */
const DOCUMENT_PAGE_CLASS =
  'ai-mode-document mx-auto w-full max-w-[860px] px-5 py-6 tablet:!px-8 tablet:!py-8';

interface DocumentPaneProps {
  readonly document: AIModeDocument;
  /** The open chat, whose activity is one of the review's version signals. */
  readonly chat: AgentChat | null;
  /** Document, or the publishing details form. */
  readonly tab: NotebookTab;
  readonly onTabChange: (tab: NotebookTab) => void;
  /** Work type to preselect in the details form for a note without one. */
  readonly defaultArticleType?: PublishingDefaultArticleType | null;
  /** Never editable — the mobile drawer. */
  readonly readOnly?: boolean;
  readonly className?: string;
}

/**
 * The right pane: the note the assistant is composing, in the real editor.
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
  tab,
  onTabChange,
  defaultArticleType = null,
  readOnly = false,
  className,
}: DocumentPaneProps) {
  const { note, content, loading, error, status, draftText, draftBlocks, phaseLabel } = document;
  const noteId = note?.id ?? null;
  const writing = status === 'drafting' || status === 'working';

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
      defaultArticleType,
    }),
    [content, editor, loading, saveDetailsSoon, saveDetailsNow, defaultArticleType]
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

  return (
    <div className={cn('relative flex h-full min-h-0 flex-col bg-white', className)}>
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3">
        <NotebookTabs active={tab} onChange={onTabChange} labels={{ details: 'Publish' }} />
        {document.notebookHref && (
          <a
            href={document.notebookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Open in notebook
          </a>
        )}
      </div>

      {/* The document is the pane: no gutter, no card, just the page. The
          editor stays mounted behind the details tab — it holds the review
          and autosave state, and the form publishes from it. */}
      <div className={cn('min-h-0 flex-1 overflow-y-auto', tab !== 'document' && 'hidden')}>
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
          <article className={cn(DOCUMENT_PAGE_CLASS, 'animate-in fade-in duration-300')}>
            {editorLostContent && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                This document couldn’t be displayed here. Open it in the notebook to view it;
                nothing has been changed.
              </div>
            )}
            {status === 'empty' && review.review == null && <EmptyDocument />}

            {/* Mounted once per note: the editor's content prop is only read on
                creation, and later versions arrive through the review. */}
            <div className={writing && !document.hasWrittenVersion ? 'hidden' : undefined}>
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

      {tab === 'details' && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <PublishingHostProvider value={publishingHost}>
            <PublishingForm />
          </PublishingHostProvider>
        </div>
      )}

      {review.review && tab === 'document' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <NoteReviewControls
            changeCount={review.review.changeCount}
            onAccept={review.accept}
            onReject={review.reject}
          />
        </div>
      )}
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
        <span>
          Drafting
          <span className="mx-2 text-gray-300" aria-hidden="true">
            ·
          </span>
          Preview updates live
        </span>
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
