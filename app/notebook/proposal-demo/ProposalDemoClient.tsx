'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { NoteCreationPopover } from '@/components/Notebook/NoteCreationPopover';
import { htmlToTiptap } from '@/components/Editor/lib/convert';
import { PROPOSAL_DEMO_TITLE } from '@/components/Editor/lib/data/proposalDemoContent';

interface ProposalDemoClientProps {
  html: string;
}

export function ProposalDemoClient({ html }: ProposalDemoClientProps) {
  const router = useRouter();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { refreshNotes } = useNotebookContext();
  const [{ isLoading: isCreatingNote }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent }, updateNoteContent] = useNoteContent();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!selectedOrg || isLoadingOrg || hasStarted.current) return;

    hasStarted.current = true;

    const createDemoNote = async () => {
      try {
        const {
          json,
          html: serializedHtml,
          plainText,
          title,
        } = htmlToTiptap(html, PROPOSAL_DEMO_TITLE);

        const newNote = await createNote({
          organizationSlug: selectedOrg.slug,
          title: title || PROPOSAL_DEMO_TITLE,
          grouping: 'WORKSPACE',
          documentType: 'PREREGISTRATION',
        });

        if (newNote) {
          await updateNoteContent({
            note: newNote.id,
            fullSrc: serializedHtml,
            fullJson: JSON.stringify(json),
            plainText,
          });

          refreshNotes();
          router.replace(
            `/notebook/${selectedOrg.slug}/${newNote.id}?template=preregistration&newFunding=true&proposalDemo=true`
          );
        }
      } catch (err) {
        console.error('Failed to create proposal demo note:', err);
        hasStarted.current = false;
      }
    };

    void createDemoNote();
  }, [selectedOrg, isLoadingOrg, html, createNote, updateNoteContent, refreshNotes, router]);

  if (isLoadingOrg) {
    return null;
  }

  return <NoteCreationPopover isOpen={isCreatingNote || isUpdatingContent} />;
}
