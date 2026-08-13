'use client';

import { NoteListItem } from '@/components/Notebook/LeftSidebar/NoteListItem';
import { isChangelogNote, type Note } from '@/types/note';
import { NoteListSkeleton } from '@/components/skeletons/NoteListSkeleton';
import { useTransition } from 'react';
import { useUser } from '@/contexts/UserContext';

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, isLoading = false }) => {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const isModerator = !!user?.isModerator;

  const filteredAndSortedNotes = notes
    .filter(
      (note) =>
        (note.access === 'WORKSPACE' || note.access === 'SHARED' || note.access === 'PRIVATE') &&
        (isModerator || !isChangelogNote(note))
    )
    .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());

  if (isLoading || notes.length === 0) {
    return <NoteListSkeleton />;
  }

  if (filteredAndSortedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <p className="text-sm text-gray-400">No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 tablet:!space-y-0.5 lg:max-h-[300px] max-h-none overflow-y-auto pr-1">
      {filteredAndSortedNotes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          disabled={isPending}
          startTransition={startTransition}
        />
      ))}
    </div>
  );
};
