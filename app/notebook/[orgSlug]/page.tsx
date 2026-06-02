'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

// An empty document for the "Start blank" funding-opportunity path.
const BLANK_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as typeof grantTemplate;

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();

  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';
  const grantSource = searchParams.get('grantSource');
  const proposalSource = searchParams.get('proposalSource');

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
    } else if (isNewFunding) {
      // "Upload a document" is handled inline in OpenProposalModal; here we
      // only create from template/blank.
      if (proposalSource === 'blank') {
        createNoteWithContent(selectedOrg.slug, {
          template: BLANK_DOCUMENT,
          documentType: 'PREREGISTRATION',
        });
      } else {
        handleStartFromTemplate();
      }
    } else if (isNewGrant) {
      // "Upload a document" is handled inline in OpenFundingOpportunityModal;
      // here we only create from template/blank.
      createNoteWithContent(selectedOrg.slug, {
        template: grantSource === 'blank' ? BLANK_DOCUMENT : grantTemplate,
        queryParam: 'newGrant',
        queryValue: 'true',
        documentType: 'GRANT',
      });
    }
  }, [selectedOrg, isNewResearch, isNewFunding, isNewGrant, grantSource, proposalSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartFromTemplate = async () => {
    if (!selectedOrg) return;
    await createNoteWithContent(selectedOrg.slug, {
      template: proposalTemplate,
      queryParam: 'template',
      queryValue: 'preregistration',
      documentType: 'PREREGISTRATION',
    });
  };

  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  return <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />;
}
