'use client';

import { NoteListItem } from './NoteListItem';
import { Note } from '@/types/note';
import { NoteListSkeleton } from '@/components/skeletons/NoteListSkeleton';

interface NoteListProps {
  notes: Note[];
  type: 'workspace' | 'private';
  isLoading?: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, type, isLoading = false }) => {
  if (isLoading || notes.length === 0) {
    return <NoteListSkeleton />;
  }

  const filteredNotes = notes.filter((note: Note) => {
    if (type === 'workspace') {
      return note.access === 'WORKSPACE' || note.access === 'SHARED';
    } else {
      return note.access === 'PRIVATE';
    }
  });

  if (filteredNotes.length === 0) {
    return (
      <div className="text-sm text-gray-500 px-2.5">
        No {type === 'workspace' ? 'workspace' : 'private'} notes
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {filteredNotes.map((note) => (
        <NoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
};
