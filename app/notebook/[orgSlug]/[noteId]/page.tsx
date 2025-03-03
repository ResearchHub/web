'use client';

import { useNote, useUpdateNote } from '@/hooks/useNote';
import { useParams, useSearchParams } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useEffect, useState, useRef } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [aiToken, setAiToken] = useState<string | null>(null);

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { setNotes } = useOrganizationNotesContext();
  const { setNoteId, setNote } = useNotebookPublish();
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
    }
  }, [isNewFunding]);

  useEffect(() => {
    setNoteId(noteId);
  }, [noteId, setNoteId]);

  useEffect(() => {
    if (!isLoadingOrg && selectedOrg) {
      fetchNote();
    }
  }, [isLoadingOrg, selectedOrg, fetchNote]);

  useEffect(() => {
    if (note) {
      setNote(note);
    }
  }, [note, setNote]);

  useEffect(() => {
    const fetchAiToken = async () => {
      try {
        const response = await fetch('/notebook/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(
            'Failed to fetch AI token. Please set TIPTAP_AI_SECRET in your environment.'
          );
        }

        const data = await response.json();
        setAiToken(data.token);
      } catch (error) {
        console.error((error as Error).message);
        setAiToken(null);
      }
    };

    fetchAiToken();
  }, []);

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
          aiToken={aiToken ?? undefined}
          ydoc={null} // TODO: Add ydoc and provider
          provider={null} // TODO: Add ydoc and provider
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
