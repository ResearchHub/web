'use client';

import { NoteListItem } from '@/app/notebook/components/LeftSidebar/NoteListItem';
import { Note } from '@/types/note';
import { NoteListSkeleton } from '@/components/skeletons/NoteListSkeleton';
import { useTransition } from 'react';

interface NoteListProps {
  notes: Note[];
  type: 'workspace' | 'private';
  isLoading?: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, type, isLoading = false }) => {
  const [isPending, startTransition] = useTransition();

  const filteredAndSortedNotes = notes
    .filter((note) =>
      type === 'workspace'
        ? note.access === 'WORKSPACE' || note.access === 'SHARED'
        : note.access === 'PRIVATE'
    )
    .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());

  if (isLoading || notes.length === 0) {
    return <NoteListSkeleton />;
  }

  if (filteredAndSortedNotes.length === 0) {
    return <div className="text-sm text-gray-500 px-2.5">No {type} notes</div>;
  }

  return (
    <div className="space-y-0.5 lg:max-h-[300px] max-h-none overflow-y-auto pr-1">
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
