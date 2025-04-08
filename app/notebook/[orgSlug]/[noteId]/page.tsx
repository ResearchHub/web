'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useEffect, useState } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useUpdateNote } from '@/hooks/useNote';
import { Button } from '@/components/ui/Button';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const [isLegacyNote, setIsLegacyNote] = useState(false);

  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    updateNoteTitle,
    isLoading,
  } = useNotebookContext();

  const [{ isLoading: isUpdating }, updateNote] = useUpdateNote(noteId, {
    onTitleUpdate: (newTitle) => {
      updateNoteTitle(newTitle);
    },
  });

  // Show funding modal and set article type when landing on a new funding note
  useEffect(() => {
    console.log('isNewFunding', isNewFunding);
    if (isNewFunding) {
      setShowFundingModal(true);
    }
  }, [isNewFunding]);

  useEffect(() => {
    if (note) {
      const isLegacy = !note.contentJson && isFeatureEnabled('legacyNoteBanner');
      setIsLegacyNote(isLegacy);
    }
  }, [note]);

  // Handle loading states
  if (isLoadingNote) {
    return <NotebookSkeleton />;
  }

  // Handle errors by showing the 404 page
  if (noteError) {
    notFound();
  }

  // Handle missing note data
  if (!note) {
    return <NotebookSkeleton />;
  }

  return (
    <>
      <div className="h-full">
        <div className="min-h-screen bg-gray-50">
          <div className={'p-4 max-w-4xl mx-auto'}>
            {isLegacyNote && isFeatureEnabled('legacyNoteBanner') && (
              <div className="sticky top-0 z-10" role="status" aria-live="polite">
                <LegacyNoteBanner orgSlug={orgSlug} noteId={noteId} />
              </div>
            )}
            <div
              className={`bg-white rounded-lg shadow-md p-0 lg:p-8 lg:pl-16 min-h-[800px] ${
                isLegacyNote && isFeatureEnabled('legacyNoteBanner')
                  ? 'opacity-70 blur-sm pointer-events-none select-none'
                  : ''
              }`}
            >
              <BlockEditor
                content={note.content}
                contentJson={note.contentJson}
                isLoading={false}
                onUpdate={
                  isLegacyNote && isFeatureEnabled('legacyNoteBanner') ? undefined : updateNote
                }
                editable={!(isLegacyNote && isFeatureEnabled('legacyNoteBanner'))}
              />
            </div>
          </div>
        </div>
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
