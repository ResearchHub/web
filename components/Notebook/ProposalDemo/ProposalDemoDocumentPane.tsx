'use client';

import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaperWrapper } from '../NotePaperWrapper';
import { NotePaperSkeleton } from '../NotePaperSkeleton';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useUpdateNote } from '@/hooks/useNote';
import { ProposalDemoTextMenu } from './ProposalDemoTextMenu';
import { SuggestionReview } from './SuggestionReview';

/**
 * The generated proposal, rendered as a live (editable, autosaving) document
 * inside the demo's artifact pane. A slimmed-down version of the editor column
 * in `NoteEditorLayout` — no tabs, no publishing form, no legacy handling.
 * Uses the demo's AI-first selection toolbar instead of the default one.
 */
export function ProposalDemoDocumentPane() {
  const {
    currentNote: note,
    isLoadingNote,
    editor,
    setEditor,
    updateNoteTitle,
  } = useNotebookContext();

  const [, updateNote] = useUpdateNote(note?.id, {
    onTitleUpdate: updateNoteTitle,
  });

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-4 py-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {isLoadingNote || !note ? (
          <NotePaperSkeleton />
        ) : (
          <NotePaperWrapper canvas={false} className="p-0 lg:!p-8 lg:!pl-16">
            <div className="mb-5 flex items-center gap-2 lg:-ml-12 lg:-mt-3">
              <span className="text-sm font-medium text-gray-700">Proposal</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Draft
              </span>
            </div>
            <BlockEditor
              content={note.content}
              contentJson={note.contentJson}
              isLoading={false}
              onUpdate={updateNote}
              editable
              setEditor={setEditor}
              showTextMenu={false}
              disableMath
            />
            {editor && <ProposalDemoTextMenu editor={editor} />}
            {editor && <SuggestionReview editor={editor} />}
          </NotePaperWrapper>
        )}
      </div>
    </div>
  );
}
