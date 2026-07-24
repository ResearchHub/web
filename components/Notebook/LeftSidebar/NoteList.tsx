'use client';

import { NoteListItem } from '@/components/Notebook/LeftSidebar/NoteListItem';
import { Note } from '@/types/note';
import { NoteListSkeleton } from '@/components/skeletons/NoteListSkeleton';
import { useTransition } from 'react';

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, isLoading = false }) => {
  const [isPending, startTransition] = useTransition();

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
  );

  if (isLoading || notes.length === 0) {
    return <NoteListSkeleton />;
  }

  return (
    <div className="space-y-0.5 lg:max-h-[300px] max-h-none overflow-y-auto pr-1">
      {sortedNotes.map((note) => (
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
