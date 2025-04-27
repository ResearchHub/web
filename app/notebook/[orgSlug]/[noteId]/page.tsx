'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useUpdateNote } from '@/hooks/useNote';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

const NotePaper = () => {
  return (
    <div className="h-full">
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="pt-8 lg:pt-16 pl-16 bg-white rounded-lg shadow-md min-h-[800px]">
            <NotebookSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NotePage() {
  const searchParams = useSearchParams();
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const [isLegacyNote, setIsLegacyNote] = useState<boolean | undefined>(undefined);

  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    updateNoteTitle,
    isLoading,
    setEditor,
  } = useNotebookContext();
  const { selectedOrg } = useOrganizationContext();

  const [{ isLoading: isUpdating }, updateNote] = useUpdateNote(note?.id, {
    onTitleUpdate: (newTitle) => {
      updateNoteTitle(newTitle);
    },
  });

  // Show funding modal and set article type when landing on a new funding note
  useEffect(() => {
    if (isNewFunding) {
      setShowFundingModal(true);
    }
  }, [isNewFunding]);

  useEffect(() => {
    if (isLoadingNote) {
      return;
    }

    if (!note || noteError) {
      setIsLegacyNote(false);
      return;
    }

    const isLegacy = !note.contentJson && isFeatureEnabled('legacyNoteBanner');
    setIsLegacyNote(isLegacy);
  }, [note, noteError, isLoadingNote]);

  // Handle loading states
  if (isLoadingNote || isLegacyNote === undefined) {
    return <NotePaper />;
  }

  // Handle errors by showing the 404 page
  if (noteError) {
    notFound();
  }

  // Handle missing note data
  if (!note) {
    return <NotePaper />;
  }

  return (
    <>
      <div className="h-full">
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 max-w-4xl mx-auto">
            {isLegacyNote && selectedOrg && (
              <div className="sticky top-0 z-10" role="status" aria-live="polite">
                <LegacyNoteBanner orgSlug={selectedOrg.slug} noteId={note.id.toString()} />
              </div>
            )}
            <div
              className={`bg-white rounded-lg shadow-md p-0 lg:p-8 lg:pl-16 min-h-[800px] ${
                isLegacyNote ? 'opacity-70 blur-sm pointer-events-none select-none' : ''
              }`}
            >
              <BlockEditor
                content={note.content}
                contentJson={note.contentJson}
                isLoading={false}
                onUpdate={isLegacyNote ? undefined : updateNote}
                editable={!(isLegacyNote && isFeatureEnabled('legacyNoteBanner'))}
                setEditor={setEditor}
              />
            </div>
          </div>
        </div>
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
