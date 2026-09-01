'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import { initialContent } from '@/components/Editor/lib/data/initialContent';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import {
  getDocumentTitle,
  getTemplatePlainText,
} from '@/components/Editor/lib/utils/documentTitle';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { NoteCreationPopover } from '@/components/Notebook/NoteCreationPopover';
import { useUser } from '@/contexts/UserContext';
import type { ID } from '@/types/root';

// An empty document for the "Start blank" funding-opportunity path. The
// notebook editor's schema is 'heading block+', so the document must open with
// a heading (the title) followed by at least one block.
const BLANK_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'heading', attrs: { textAlign: 'left', level: 1 } }, { type: 'paragraph' }],
} as typeof grantTemplate;

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();
  const { user, isLoading: isLoadingUser } = useUser();
  const isModerator = !!user?.isModerator;

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();

  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewChangelog = searchParams.get('newChangelog') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';
  const grantSource = searchParams.get('grantSource');
  const proposalSource = searchParams.get('proposalSource');
  const selectedGrantId = searchParams.get('selectedGrantId') ?? undefined;

  const createNoteWithContent = async (
    orgSlug: string,
    {
      template,
      queryParam,
      queryValue,
      documentType,
      selectedGrantId,
    }: {
      template: typeof proposalTemplate | typeof grantTemplate | typeof initialContent;
      queryParam?: string;
      queryValue?: string;
      documentType?: string;
      selectedGrantId?: Exclude<ID, null | undefined>;
    }
  ) => {
    try {
      const title = getDocumentTitle(template) || 'Untitled';
      const newNote = await createNote({
        organizationSlug: orgSlug,
        title,
        grouping: 'WORKSPACE',
        documentType,
        selectedGrantId,
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
    if (!selectedOrg || isLoadingUser) return;

    if (isNewChangelog) {
      if (!isModerator) {
        router.replace(`/notebook/${selectedOrg.slug}`);
        return;
      }

      createNoteWithContent(selectedOrg.slug, {
        template: initialContent,
        queryParam: 'newChangelog',
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
          selectedGrantId,
        });
      } else {
        handleStartFromTemplate(selectedGrantId);
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
  }, [
    selectedOrg,
    isLoadingUser,
    isModerator,
    isNewChangelog,
    isNewFunding,
    isNewGrant,
    grantSource,
    proposalSource,
    selectedGrantId,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartFromTemplate = async (selectedGrantId?: Exclude<ID, null | undefined>) => {
    if (!selectedOrg) return;
    await createNoteWithContent(selectedOrg.slug, {
      template: proposalTemplate,
      queryParam: 'template',
      queryValue: 'preregistration',
      documentType: 'PREREGISTRATION',
      selectedGrantId,
    });
  };

  // NoteEditorLayout (rendered as a sibling in the layout) already shows the
  // appropriate UI (NotebookHome here), so rendering the document skeleton here
  // just produces a redundant outline flash before the org resolves.
  if (isLoadingOrg) {
    return null;
  }

  return <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />;
}
