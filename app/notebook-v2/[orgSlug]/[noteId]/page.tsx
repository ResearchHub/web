'use client';

import { useParams, useSearchParams, notFound } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContextV2';
import { useEffect, useState } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useOrganizationDataContext } from '@/contexts/OrganizationDataContext';
import { useUpdateNote } from '@/hooks/useNote';

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const { selectedOrg } = useOrganizationContext();
  const {
    currentNote: note,
    isLoadingNote,
    noteError,
    updateNoteTitle,
  } = useOrganizationDataContext();

  const [{ isLoading: isUpdating }, updateNote] = useUpdateNote(noteId, {
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
    notFound();
  }

  let content = note.content;
  let contentJson = note.contentJson;

  //todo: do we really need this? or just display empty note?
  if (!content && !contentJson) {
    const defaultTemplate = JSON.stringify(preregistrationTemplate);
    contentJson = defaultTemplate;
  }

  return (
    <>
      <div className="h-full">
        <div className="min-h-screen p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 pl-16">
            <BlockEditor
              content={content || ''}
              contentJson={contentJson}
              isLoading={false}
              onUpdate={updateNote}
            />
          </div>
        </div>
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
