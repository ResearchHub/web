'use client';

import { useNote } from '@/hooks/useNote';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';
import { useEffect, useState } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const { selectedOrg } = useOrganizationContext();
  const { notes, isLoading: isLoadingNotes } = useOrganizationNotesContext();
  const { setArticleType } = useNotebookPublish();
  const [shouldFetchContent, setShouldFetchContent] = useState(false);

  // Show funding modal and set article type when landing on a new funding note
  useEffect(() => {
    if (isNewFunding) {
      setShowFundingModal(true);
      setArticleType('preregistration');
    }
  }, [isNewFunding, setArticleType]);

  // Find the note in our list if available
  const initialNote = notes.find((n) => n.id.toString() === noteId);

  // Only fetch content after initial mount and when we have the metadata
  useEffect(() => {
    if (initialNote) {
      setShouldFetchContent(true);
    }
  }, [initialNote?.id]);

  // Fetch the current note only when we need the content
  const {
    note,
    isLoading: isLoadingNote,
    error,
  } = useNote(shouldFetchContent ? noteId : null, initialNote);

  // Redirect to first note if no note is selected
  useEffect(() => {
    if (!isLoadingNotes && notes.length > 0 && !noteId) {
      router.push(`/notebook/${orgSlug}/${notes[0].id}`);
    }
  }, [notes, isLoadingNotes, noteId, orgSlug, router]);

  // Handle organization mismatch or missing data
  if (orgSlug !== selectedOrg?.slug || !noteId) {
    return <NotebookSkeleton />;
  }

  // Show metadata immediately while content loads
  if (!shouldFetchContent && initialNote) {
    return (
      <div className="h-full">
        <BlockEditor content="" isLoading={true} noteId={initialNote.id} />
      </div>
    );
  }

  // Handle loading states
  if (isLoadingNotes || isLoadingNote) {
    return <NotebookSkeleton />;
  }

  // Handle missing note data
  if (!note) {
    return <NotebookSkeleton />;
  }

  // Let error boundary handle any errors
  if (error) {
    throw error;
  }

  // If the note exists but has no content, use the preregistration template
  let content = note.content;
  let contentJson = note.contentJson;

  if (!content && !contentJson) {
    const defaultTemplate = JSON.stringify(preregistrationTemplate);
    content = defaultTemplate;
    contentJson = defaultTemplate;
  }

  return (
    <>
      <div className="h-full">
        <BlockEditor
          content={content || ''}
          contentJson={contentJson}
          isLoading={false}
          noteId={note.id}
        />
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
