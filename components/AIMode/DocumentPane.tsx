'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ExternalLink, FileText, X } from 'lucide-react';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { NoteReviewBanner } from '@/components/Notebook/NoteReview/NoteReviewBanner';
import { NoteReviewControls } from '@/components/Notebook/NoteReview/NoteReviewControls';
import { noteDiffPersistableDoc } from '@/components/Notebook/NoteReview/noteDiffOverlay';
import { useNoteAgentReview } from '@/components/Notebook/NoteReview/useNoteAgentReview';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { useUpdateNote } from '@/hooks/useNote';
import { useNoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import type { NotebookChat } from '@/types/notebookChat';
import { cn } from '@/utils/styles';
import type { AIModeDocument } from './useAIModeDocument';

/** Level 1 and 2 headings are sections; deeper ones are their subdivisions. */
const SECTION_HEADING_LEVELS = new Set([1, 2]);

function countSections(editor: Editor | null): number {
  if (editor == null || editor.isDestroyed) return 0;
  let count = 0;
  // Mid-review the live document also holds the struck (pending-removal)
  // ranges; count what accepting would keep.
  const doc = noteDiffPersistableDoc(editor) ?? editor.state.doc;
  doc.forEach((node) => {
    if (
      node.type.name === 'heading' &&
      SECTION_HEADING_LEVELS.has(node.attrs.level ?? 1) &&
      node.textContent.trim().length > 0
    ) {
      count += 1;
    }
  });
  return count;
}

/** Live heading count of the editor's document. */
function useSectionCount(editor: Editor | null): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (editor == null) {
      setCount(0);
      return;
    }
    const update = () => setCount(countSections(editor));
    update();
    editor.on('update', update);
    return () => {
      editor.off('update', update);
    };
  }, [editor]);
  return count;
}

interface DocumentPaneProps {
  readonly document: AIModeDocument;
  /** The open chat, whose activity is one of the review's version signals. */
  readonly chat: NotebookChat | null;
  readonly onClose: () => void;
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
  onClose,
  readOnly = false,
  className,
}: DocumentPaneProps) {
  const { note, content, loading, error, status, draftText, phaseLabel } = document;
  const noteId = note?.id ?? null;
  const title = content?.title?.trim() || note?.title?.trim() || 'Document';
  const writing = status === 'drafting' || status === 'working';

  // ---- the editor, its autosave, and the assistant-version review ----
  const [editor, setEditor] = useState<Editor | null>(null);
  const { saveDetailsSoon } = useNoteDetailsSaver(noteId ?? undefined);
  const [, updateNote, saveNoteNow] = useUpdateNote(noteId ?? undefined, {
    saveTitle: (nextTitle) => saveDetailsSoon({ title: nextTitle }),
    // Mid-review the editor holds a merged document; saves must persist it
    // without the struck (pending-removal) ranges.
    docToPersist: (instance) => noteDiffPersistableDoc(instance) ?? instance.state.doc,
  });
  // A brand-new note has no version yet, and mounting the editor on it
  // dispatches a document-changing transaction of its own (UniqueID stamps
  // the schema's empty heading). Saving that would give the note an
  // editor-authored first version and make the assistant's first edit_note
  // stale. Nothing of the user's exists to save until they type.
  const hasWrittenVersion = document.hasWrittenVersion;
  const handleEditorUpdate = useCallback(
    (instance: Editor) => {
      if (!hasWrittenVersion && instance.state.doc.textContent.trim().length === 0) return;
      updateNote(instance);
    },
    [hasWrittenVersion, updateNote]
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
  const locked = writing;

  const sectionCount = useSectionCount(editor) + (draftText != null ? 1 : 0);

  return (
    <div className={cn('relative flex h-full min-h-0 flex-col bg-gray-50/60', className)}>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
        <FileText className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800" title={title}>
          {title}
        </h2>
        {sectionCount > 0 && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-px text-[11px] font-semibold',
              writing ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'
            )}
          >
            {writing && <Loader size="sm" className="!h-2.5 !w-2.5 text-primary-500" />}
            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </span>
        )}
        {document.notebookHref && (
          <a
            href={document.notebookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Open in notebook
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close document"
          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 tablet:!p-5">
        <NoteReviewBanner review={review} className="mx-auto mb-3 max-w-[640px]" />

        {error && content == null ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-gray-600">{error}</p>
            <Button variant="outlined" size="sm" onClick={document.reload}>
              Try again
            </Button>
          </div>
        ) : loading || content == null ? (
          <div className="flex justify-center py-16">
            <Loader size="md" className="text-primary-500" />
          </div>
        ) : (
          <article className="ai-mode-document mx-auto max-w-[640px] rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm tablet:!px-9 tablet:!py-9">
            {status === 'empty' && review.review == null && (
              <EmptyDocument label={phaseLabel} active={false} />
            )}
            {status === 'working' && !document.hasWrittenVersion && (
              <EmptyDocument label={phaseLabel} active />
            )}

            {/* Mounted once per note: the editor's content prop is only read on
                creation, and later versions arrive through the review. */}
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

            {status === 'drafting' && draftText && <DraftSection text={draftText} />}

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
            onAccept={review.accept}
            onReject={review.reject}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The note exists but has no version yet. Spins only while a turn is
 * running; a settled conversation that never wrote anything says so plainly.
 */
function EmptyDocument({
  label,
  active,
}: {
  readonly label: string | null;
  readonly active: boolean;
}) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2 rounded-lg bg-gray-50 px-4 py-5 text-center">
      {active ? (
        <>
          <Loader size="sm" className="text-primary-500" />
          <p className="text-sm font-medium text-gray-700">Starting the document…</p>
          {label && <p className="text-xs text-gray-500">{label}</p>}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Nothing has been written here yet. You can start typing, or ask the assistant.
        </p>
      )}
    </div>
  );
}

/** The section being written, appended below the settled content. */
function DraftSection({ text }: { readonly text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
  return (
    <section
      aria-live="polite"
      aria-label="Section being written"
      className="prose prose-sm prose-neutral mt-6 max-w-none border-t border-dashed border-primary-200 pt-5"
    >
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary-600">
        <Loader size="sm" className="!h-2.5 !w-2.5" />
        Writing
      </div>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
          {index === paragraphs.length - 1 && (
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary-500" />
          )}
        </p>
      ))}
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
