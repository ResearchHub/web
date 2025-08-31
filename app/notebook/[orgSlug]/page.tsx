'use client';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NotePaperSkeleton } from '../components/NotePaperSkeleton';
import { NotePaperWrapper } from '../components/NotePaperWrapper';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import proposalTemplate from '@/components/Editor/lib/data/proposalTemplate';
import { getInitialContent, initialContent } from '@/components/Editor/lib/data/initialContent';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import { getDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import { useCreateNote } from '@/hooks/useNote';
import { useNoteContent } from '@/hooks/useNote';
import { NoteCreationPopover } from '../components/NoteCreationPopover';

export default function OrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();

  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();

  // Get URL search params
  const isNewFunding = searchParams.get('newFunding') === 'true';
  const isNewResearch = searchParams.get('newResearch') === 'true';
  const isNewGrant = searchParams.get('newGrant') === 'true';

  // Helper function to create notes using hooks
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
          plainText: template.content
            .map((block) => block.content?.map((c) => c.text).join(' '))
            .filter(Boolean)
            .join('\n'),
        });

        const queryString = queryParam && queryValue ? `?${queryParam}=${queryValue}` : '';

        refreshNotes();
        router.push(`/notebook/${orgSlug}/${newNote.id}${queryString}`);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  // Handle routing logic based on search params
  useEffect(() => {
    if (!selectedOrg) return;

    const handleRouting = async () => {
      try {
        if (isNewFunding) {
          await createNoteWithContent(selectedOrg.slug, {
            template: proposalTemplate,
            queryParam: 'newFunding',
            queryValue: 'true',
          });
          return;
        }

        if (isNewResearch) {
          await createNoteWithContent(selectedOrg.slug, {
            template: getInitialContent('research'),
            queryParam: 'newResearch',
            queryValue: 'true',
          });
          return;
        }

        if (isNewGrant) {
          await createNoteWithContent(selectedOrg.slug, {
            template: grantTemplate,
            queryParam: 'newGrant',
            queryValue: 'true',
          });
          return;
        }
      } catch (err) {
        console.error('Failed to handle routing:', err);
      }
    };

    handleRouting();
  }, [selectedOrg, isNewFunding, isNewResearch, isNewGrant]);

  // Show loading state while creating note or updating content
  if (isLoadingOrg) {
    return <NotePaperSkeleton />;
  }

  return (
    <>
      <NotePaperWrapper>
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {selectedOrg?.name ? `Welcome to ${selectedOrg.name}` : 'Welcome'}
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Please select a note from the sidebar to view or edit its contents.
              </p>
              <p className="text-sm text-gray-500">
                You can also create a new note by clicking the "New Note" button in the sidebar.
              </p>
            </div>
          </div>
        </div>
      </NotePaperWrapper>

      <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />
    </>
  );
}
