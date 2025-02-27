'use client';

import { File, MoreHorizontal, Copy, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useDeleteNote } from '@/hooks/useNote';
import type { Note } from '@/types/note';
import toast from 'react-hot-toast';
import { useOrganizationNotesContext } from '@/contexts/OrganizationNotesContext';
import React from 'react';

interface NoteListItemProps {
  note: Note;
  isSelected?: boolean;
}

/**
 * A single note item in the sidebar list
 */
export const NoteListItem: React.FC<NoteListItemProps> = ({ note, isSelected }) => {
  const router = useRouter();
  const [{ isLoading: isDeleting }, deleteNote] = useDeleteNote();
  const { setNotes } = useOrganizationNotesContext();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleClick = () => {
    router.replace(`/notebook/${note.organization.slug}/${note.id}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Duplicate clicked for note:', note.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm('Are you sure you want to delete this note? This action cannot be undone.')
    ) {
      return;
    }
    try {
      await deleteNote(note.id);
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
      if (isSelected) {
        router.push(`/notebook/${note.organization.slug}`);
      }
    } catch (error) {
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const menuTriggerButton = (
    <button
      className={`p-1 rounded-md transition-opacity
        bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-700
        ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      onClick={(e) => e.stopPropagation()}
      disabled={isDeleting}
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  );

  return (
    <div className={`group relative ${isDeleting ? 'opacity-50' : ''}`}>
      <Button
        variant="ghost"
        className={`w-full justify-start px-2.5 py-1.5 h-8 text-sm font-normal text-gray-700 group
          ${isSelected ? 'bg-gray-100 hover:bg-gray-100' : 'hover:bg-gray-50'}`}
        onClick={handleClick}
        disabled={isDeleting}
        title={note.title}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
        ) : (
          <File
            className={`h-3.5 w-3.5 ${
              isSelected ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
            } transition-colors`}
          />
        )}
        <span className="ml-2 truncate">{note.title}</span>
      </Button>

      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <BaseMenu trigger={menuTriggerButton} className="p-1" onOpenChange={setIsMenuOpen}>
          <BaseMenuItem onClick={handleDuplicate} disabled={isDeleting}>
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </div>
          </BaseMenuItem>
          <BaseMenuItem onClick={handleDelete} disabled={isDeleting}>
            <div className="flex items-center gap-2 text-red-600">
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </div>
          </BaseMenuItem>
        </BaseMenu>
      </div>
    </div>
  );
};
