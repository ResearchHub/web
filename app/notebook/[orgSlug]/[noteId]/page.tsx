'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useUpdateNote } from '@/hooks/useNote';
import { FeatureFlag, isFeatureEnabled } from '@/utils/featureFlags';
import { LegacyNoteBanner } from '@/components/LegacyNoteBanner';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NotePaperSkeleton } from '../../components/NotePaperSkeleton';
import { NotePaperWrapper } from '../../components/NotePaperWrapper';

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

    const isLegacy = !note.contentJson && isFeatureEnabled(FeatureFlag.LegacyNoteBanner);
    setIsLegacyNote(isLegacy);
  }, [note, noteError, isLoadingNote]);

  // Handle loading states
  if (isLoadingNote || isLegacyNote === undefined) {
    return <NotePaperSkeleton />;
  }

  // Handle errors by showing the 404 page
  if (noteError) {
    notFound();
  }

  // Handle missing note data
  if (!note) {
    return <NotePaperSkeleton />;
  }

  return (
    <>
      <NotePaperWrapper
        className={`p-0 lg:p-8 lg:pl-16 ${
          isLegacyNote ? 'opacity-70 blur-sm pointer-events-none select-none' : ''
        }`}
        showBanner={
          isLegacyNote && selectedOrg ? (
            <LegacyNoteBanner orgSlug={selectedOrg.slug} noteId={note.id.toString()} />
          ) : undefined
        }
      >
        <BlockEditor
          content={note.content}
          contentJson={note.contentJson}
          isLoading={false}
          onUpdate={isLegacyNote ? undefined : updateNote}
          editable={!(isLegacyNote && isFeatureEnabled(FeatureFlag.LegacyNoteBanner))}
          setEditor={setEditor}
        />
      </NotePaperWrapper>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
