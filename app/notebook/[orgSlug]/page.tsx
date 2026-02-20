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

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();

  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';

  const createNoteWithContent = async (
    orgSlug: string,
    {
      template,
      queryParam,
      queryValue,
    }: {
      template: typeof proposalTemplate | typeof initialContent | typeof grantTemplate;
      queryParam?: string;
      queryValue?: string;
    }
  ) => {
    try {
      const title = getDocumentTitle(template) || 'Untitled';
      const newNote = await createNote({
        organizationSlug: orgSlug,
        title,
        grouping: 'WORKSPACE',
      });

      if (newNote) {
        await updateNoteContent({
          note: newNote.id,
          fullJson: JSON.stringify(template),
          plainText: getTemplatePlainText(template),
        });

        const queryString = queryParam && queryValue ? `?${queryParam}=${queryValue}` : '';
        refreshNotes();
        router.push(`/notebook/${orgSlug}/${newNote.id}${queryString}`);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  useEffect(() => {
    if (!selectedOrg) return;

    if (isNewFunding) {
      createNoteWithContent(selectedOrg.slug, {
        template: proposalTemplate,
        queryParam: 'newFunding',
        queryValue: 'true',
      });
    } else if (isNewResearch) {
      createNoteWithContent(selectedOrg.slug, {
        template: getInitialContent('research'),
        queryParam: 'newResearch',
        queryValue: 'true',
      });
    } else if (isNewGrant) {
      createNoteWithContent(selectedOrg.slug, {
        template: grantTemplate,
        queryParam: 'newGrant',
        queryValue: 'true',
      });
    }
  }, [selectedOrg, isNewFunding, isNewResearch, isNewGrant]); // eslint-disable-line react-hooks/exhaustive-deps

  return <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />;
}
