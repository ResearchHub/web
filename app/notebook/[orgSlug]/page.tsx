'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import { getInitialContent, initialContent } from '@/components/Editor/lib/data/initialContent';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import {
  getDocumentTitle,
  getTemplatePlainText,
} from '@/components/Editor/lib/utils/documentTitle';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { NoteCreationPopover } from '@/components/Notebook/NoteCreationPopover';
import { NotePaperSkeleton } from '@/components/Notebook/NotePaperSkeleton';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { importDocumentToTiptap } from '@/components/Editor/lib/convert';

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const [isImporting, setIsImporting] = useState(false);

  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';

  const [showFundingModal, setShowFundingModal] = useState(false);
  useEffect(() => {
    if (isNewFunding) setShowFundingModal(true);
  }, [isNewFunding]);

  const stripQueryParam = (key: string) => {
    const url = new URL(globalThis.window.location.href);
    url.searchParams.delete(key);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const createNoteWithContent = async (
    orgSlug: string,
    {
      template,
      queryParam,
      queryValue,
      documentType,
    }: {
      template: typeof proposalTemplate | typeof initialContent | typeof grantTemplate;
      queryParam?: string;
      queryValue?: string;
      documentType?: string;
    }
  ) => {
    try {
      const title = getDocumentTitle(template) || 'Untitled';
      const newNote = await createNote({
        organizationSlug: orgSlug,
        title,
        grouping: 'WORKSPACE',
        documentType,
      });

      if (newNote) {
        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(template),
          plainText: getTemplatePlainText(template),
        });

        const queryString = queryParam && queryValue ? `?${queryParam}=${queryValue}` : '';
        refreshNotes();
        router.replace(`/notebook/${orgSlug}/${newNote.id}${queryString}`);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  useEffect(() => {
    if (!selectedOrg) return;

    if (isNewResearch) {
      createNoteWithContent(selectedOrg.slug, {
        template: getInitialContent('research'),
        queryParam: 'newResearch',
        queryValue: 'true',
        documentType: 'DISCUSSION',
      });
    } else if (isNewGrant) {
      createNoteWithContent(selectedOrg.slug, {
        template: grantTemplate,
        queryParam: 'newGrant',
        queryValue: 'true',
        documentType: 'GRANT',
      });
    }
  }, [selectedOrg, isNewResearch, isNewGrant]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartFromTemplate = async () => {
    if (!selectedOrg) return;
    await createNoteWithContent(selectedOrg.slug, {
      template: proposalTemplate,
      queryParam: 'template',
      queryValue: 'preregistration',
      documentType: 'PREREGISTRATION',
    });
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedOrg) return;
    setIsImporting(true);
    try {
      const result = await importDocumentToTiptap(file);
      const newNote = await createNote({
        organizationSlug: selectedOrg.slug,
        title: result.title,
        grouping: 'WORKSPACE',
        documentType: 'PREREGISTRATION',
      });

      if (newNote) {
        await updateNoteContent({
          note: newNote.id,
          fullSrc: result.html,
          fullJson: JSON.stringify(result.json),
          plainText: result.plainText,
        });
        refreshNotes();
        router.replace(`/notebook/${selectedOrg.slug}/${newNote.id}`);
      }
    } catch (error) {
      console.error('Failed to import proposal document:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to import document. Please try a different file.';
      toast.error(message, { style: { width: '320px' } });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFundingModalClose = () => {
    setShowFundingModal(false);
    stripQueryParam('newFunding');
  };

  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  const isProposalProcessing = isCreatingNote || isUpdatingContent || isImporting;

  return (
    <>
      <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />
      <FundingTimelineModal
        isOpen={showFundingModal}
        onClose={handleFundingModalClose}
        onStartFromTemplate={handleStartFromTemplate}
        onUploadFile={handleUploadFile}
        isProcessing={isProposalProcessing}
      />
    </>
  );
}
