'use client';

import { useNote, useUpdateNote } from '@/hooks/useNote';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useEffect, useState, useRef } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { debounce } from 'lodash';
import { Editor } from '@tiptap/core';
import { NoteService } from '@/services/note.service';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';
import { getDocumentTitleFromEditor } from '@/components/Editor/lib/utils/documentTitle';

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { setNotes } = useOrganizationNotesContext();
  const { setArticleType, setNoteId } = useNotebookPublish();
  const [{ note, isLoading: isLoadingNote, error }, fetchNote] = useNote(noteId, {
    sendImmediately: false,
  });

  const [{ isLoading: isUpdating }, updateNote] = useUpdateNote(noteId, {
    onTitleUpdate: (newTitle) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id.toString() === noteId
            ? {
                ...note,
                title: newTitle,
              }
            : note
        )
      );
    },
  });

  // Show funding modal and set article type when landing on a new funding note
  useEffect(() => {
    if (isNewFunding) {
      setShowFundingModal(true);
      setArticleType('preregistration');
    }
  }, [isNewFunding, setArticleType]);

  useEffect(() => {
    setNoteId(noteId);
  }, [noteId, setNoteId]);

  useEffect(() => {
    if (!isLoadingOrg && selectedOrg) {
      fetchNote();
    }
  }, [isLoadingOrg, selectedOrg, fetchNote]);

  // Handle loading states
  if (isLoadingNote) {
    return <NotebookSkeleton />;
  }

  // Handle organization mismatch or missing data
  if (orgSlug !== selectedOrg?.slug || !noteId) {
    return <NotebookSkeleton />;
  }

  // Let error boundary handle any errors
  if (error) {
    throw error;
  }

  // Handle missing note data
  if (!note) {
    return <NotebookSkeleton />;
  }

  // If the note exists but has no content, use the preregistration template
  let content = note.content;
  let contentJson = note.contentJson;

  if (!content && !contentJson) {
    const defaultTemplate = JSON.stringify(preregistrationTemplate);
    contentJson = defaultTemplate;
  }

  return (
    <>
      <div className="h-full">
        <BlockEditor
          content={content || ''}
          contentJson={contentJson}
          isLoading={false}
          onUpdate={updateNote}
        />
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
