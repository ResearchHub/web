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
import { DEFAULT_GRANT_TITLE } from './lib/constants';

interface CreateGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGrantModal({ isOpen, onClose }: CreateGrantModalProps) {
  const { selectedOrg } = useOrganizationContext();

  const [noteId, setNoteId] = useState<number | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [, createNote] = useCreateNote();
  const [, updateContent] = useNoteContent();

  useEffect(() => {
    if (!isOpen) {
      setNoteId(null);
      setNoteError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedOrg?.slug || noteId) return;

    const init = async () => {
      setIsCreatingNote(true);
      setNoteError(null);
      try {
        const title = getDocumentTitle(grantTemplate) || DEFAULT_GRANT_TITLE;
        const newNote = await createNote({
          organizationSlug: selectedOrg.slug,
          title,
          grouping: 'WORKSPACE',
        });

        if (!newNote) {
          setNoteError('Failed to create note. Please try again.');
          return;
        }

        await updateContent({
          note: newNote.id,
          fullJson: JSON.stringify(grantTemplate),
          plainText: getTemplatePlainText(grantTemplate),
        });
        setNoteId(newNote.id);
      } catch (err) {
        setNoteError('Failed to initialize. Please try again.');
      } finally {
        setIsCreatingNote(false);
      }
    };

    init();
    // createNote and updateContent are excluded — they are not referentially
    // stable across renders and the effect should only fire on open / org change.
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
        {isCreatingNote && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Setting up your RFP...</p>
          </div>
        )}

        {noteError && (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <p className="text-sm text-red-500">{noteError}</p>
            <Button variant="outlined" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {noteId && !isCreatingNote && !noteError && (
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
