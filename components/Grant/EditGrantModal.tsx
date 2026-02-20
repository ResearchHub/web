'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { NoteEditorLayout } from '@/components/Notebook/NoteEditorLayout';

interface EditGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
}

export function EditGrantModal({ isOpen, onClose, noteId }: Readonly<EditGrantModalProps>) {
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
        <NotebookProvider noteId={noteId.toString()}>
          <SidebarProvider>
            <NoteEditorLayout defaultArticleType="grant" onClose={onClose} />
          </SidebarProvider>
        </NotebookProvider>
      </div>
    </BaseModal>
  );
}
