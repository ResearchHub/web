import type { Note } from '@/types/note';
import { NoteListItem } from './NoteListItem';

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  skeletonCount?: number;
}

/**
 * A list of notes with loading and error states
 */
export const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading,
  error,
  skeletonCount = 3,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2 px-2.5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="px-2.5 text-sm text-red-500">Failed to load notes</div>;
  }

  return (
    <div className="space-y-0.5">
      {notes.map((note) => (
        <NoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
};
