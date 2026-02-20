'use client';

import { File, MoreHorizontal, Copy, Trash2, Loader2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { useRouter } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import {
  useDeleteNote,
  useDuplicateNote,
  useMakeNotePrivate,
  useUpdateNotePermissions,
} from '@/hooks/useNote';
import type { Note } from '@/types/note';
import toast from 'react-hot-toast';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotebookContext } from '@/contexts/NotebookContext';

interface NoteListItemProps {
  note: Note;
  disabled: boolean;
  startTransition: (callback: () => void) => void;
}

export const NoteListItem = ({ note, disabled, startTransition }: NoteListItemProps) => {
  const router = useRouter();
  const { refreshNotes, setNotes, activeNoteId } = useNotebookContext();
  const [{ isLoading: isDeleting }, deleteNote] = useDeleteNote();
  const [{ isLoading: isDuplicating }, duplicateNote] = useDuplicateNote();
  const [{ isLoading: isMakingPrivate }, makeNotePrivate] = useMakeNotePrivate();
  const [{ isLoading: isUpdatingPermissions }, updateNotePermissions] = useUpdateNotePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const isPrivate = note.access === 'PRIVATE';
  const isProcessing = isDeleting || isDuplicating || isMakingPrivate || isUpdatingPermissions;
  const isSelected = note.id.toString() === activeNoteId;

  useEffect(() => {
    if (isSelected && itemRef.current) {
      const timeoutId = setTimeout(() => {
        itemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isSelected]);

  const handleClick = useCallback(() => {
    startTransition(() => {
      router.push(`/notebook/${note.organization.slug}/${note.id}`, { scroll: false });
    });
  }, [router, note.organization.slug, note.id, startTransition]);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newNote = await duplicateNote(note.id.toString(), note.organization.slug);
      toast.success('Note duplicated successfully');
      refreshNotes();
      router.replace(`/notebook/${note.organization.slug}/${newNote.id}`);
    } catch (error) {
      console.error('Error duplicating note:', error);
      toast.error('Failed to duplicate note. Please try again.');
    }
  };

  const handleToggleAccess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isPrivate) {
        await updateNotePermissions({
          noteId: note.id,
          organizationId: note.organization.id,
          accessType: 'ADMIN',
        });
        toast.success('Note moved to workspace');
      } else {
        await makeNotePrivate(note.id);
        toast.success('Note made private');
      }

      refreshNotes();
    } catch (error) {
      console.error('Error updating note access:', error);
      toast.error(
        `Failed to ${isPrivate ? 'move note to workspace' : 'make note private'}. Please try again.`
      );
    }
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
      refreshNotes();
      setNotes((prevNotes) => prevNotes.filter((n) => n.id !== note.id));
      if (isSelected) {
        router.replace(`/notebook/${note.organization.slug}`);
      }
    } catch (error) {
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const menuTriggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-auto w-auto p-1 rounded-md transition-opacity bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-700',
        isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}
      onClick={(e) => e.stopPropagation()}
      disabled={isProcessing || disabled}
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <div ref={itemRef} className={`group relative ${isProcessing || disabled ? 'opacity-50' : ''}`}>
      <Button
        variant="ghost"
        className={`w-full justify-start px-2.5 py-1.5 h-8 text-sm font-normal text-gray-700 group
          ${isSelected ? 'bg-gray-100 hover:bg-gray-100' : 'hover:bg-gray-50'}`}
        onClick={handleClick}
        disabled={isProcessing || disabled}
        title={note.title}
      >
        {isProcessing ? (
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
        <BaseMenu
          trigger={menuTriggerButton}
          className="p-1"
          onOpenChange={setIsMenuOpen}
          disabled={isProcessing || disabled}
        >
          <BaseMenuItem onClick={handleDuplicate} disabled={isProcessing}>
            <div className="flex items-center gap-2">
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
            </div>
          </BaseMenuItem>
          <BaseMenuItem onClick={handleToggleAccess} disabled={isProcessing}>
            <div className="flex items-center gap-2">
              {isMakingPrivate || isUpdatingPermissions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPrivate ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>
                {isMakingPrivate || isUpdatingPermissions
                  ? 'Updating...'
                  : isPrivate
                    ? 'Move to Workspace'
                    : 'Make Private'}
              </span>
            </div>
          </BaseMenuItem>
          <BaseMenuItem onClick={handleDelete} disabled={isProcessing}>
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
