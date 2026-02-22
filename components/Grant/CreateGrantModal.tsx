'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import {
  getDocumentTitle,
  getTemplatePlainText,
} from '@/components/Editor/lib/utils/documentTitle';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';

import { NoteEditorLayout } from '@/components/Notebook/NoteEditorLayout';

const DEFAULT_GRANT_TITLE = 'Untitled RFP';

interface CreateGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGrantModal({ isOpen, onClose }: Readonly<CreateGrantModalProps>) {
  const { selectedOrg } = useOrganizationContext();

  const [noteId, setNoteId] = useState<number | null>(null);
  const [{ isLoading: isCreatingNote, error: createNoteError }, createNote] = useCreateNote();
  const [{ isLoading: isUpdatingContent, error: updateContentError }, updateContent] =
    useNoteContent();

  const isInitializing = isCreatingNote || isUpdatingContent;
  const noteError = createNoteError?.message || updateContentError?.message || null;

  useEffect(() => {
    if (!isOpen) {
      setNoteId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedOrg?.slug || noteId) return;

    const init = async () => {
      try {
        const title = getDocumentTitle(grantTemplate) || DEFAULT_GRANT_TITLE;
        const newNote = await createNote({
          organizationSlug: selectedOrg.slug,
          title,
          grouping: 'WORKSPACE',
        });

        if (!newNote) {
          throw new Error('Failed to create note. Please try again.');
        }

        await updateContent({
          note: newNote.id,
          fullJson: JSON.stringify(grantTemplate),
          plainText: getTemplatePlainText(grantTemplate),
        });
        setNoteId(newNote.id);
      } catch (err: unknown) {
        console.error('Failed to initialize grant:', err);
      }
    };

    init();
  }, [isOpen, selectedOrg?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      padding="p-0"
      className="!max-h-screen md:!max-h-[calc(100vh-2rem)] md:!rounded-2xl"
      contentClassName="!overflow-hidden"
    >
      <div className="h-full">
        {isInitializing && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Setting up your RFP...</p>
          </div>
        )}

        {noteError && !isInitializing && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <p className="text-sm text-red-500">{noteError}</p>
            <Button variant="outlined" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {noteId && !isInitializing && !noteError && (
          <NotebookProvider noteId={noteId.toString()}>
            <SidebarProvider>
              <NoteEditorLayout defaultArticleType="grant" onClose={onClose} />
            </SidebarProvider>
          </NotebookProvider>
        )}
      </div>
    </BaseModal>
  );
}
