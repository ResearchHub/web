'use client';

import { NoteListItem } from './NoteListItem';
import { Note } from '@/types/note';
import { NoteListSkeleton } from '@/components/skeletons/NoteListSkeleton';

interface NoteListProps {
  notes: Note[];
  type: 'workspace' | 'private';
  isLoading?: boolean;
  selectedNoteId?: string;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  type,
  isLoading = false,
  selectedNoteId,
}) => {
  if (isLoading || notes.length === 0) {
    return <NoteListSkeleton />;
  }

  const filteredAndSortedNotes = notes
    .filter((note: Note) => {
      if (type === 'workspace') {
        return note.access === 'WORKSPACE' || note.access === 'SHARED';
      } else {
        return note.access === 'PRIVATE';
      }
    })
    .sort((a, b) => {
      return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
    });

  if (filteredAndSortedNotes.length === 0) {
    return (
      <div className="text-sm text-gray-500 px-2.5">
        No {type === 'workspace' ? 'workspace' : 'private'} notes
      </div>
    );
  }

  return (
    <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
      {filteredAndSortedNotes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          isSelected={selectedNoteId === note.id.toString()}
        />
      ))}
    </div>
  );
};
