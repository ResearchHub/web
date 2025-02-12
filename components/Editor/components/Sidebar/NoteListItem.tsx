'use client';

import { File } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { Note } from '@/types/note';

interface NoteListItemProps {
  note: Note;
}

/**
 * A single note item in the sidebar list
 */
export const NoteListItem: React.FC<NoteListItemProps> = ({ note }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/notebook/${note.organization.slug}/${note.id}`);
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start px-2.5 py-1.5 h-8 text-sm font-normal hover:bg-gray-50 text-gray-700 group"
      onClick={handleClick}
    >
      <File className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      <span className="ml-2 truncate">{note.title}</span>
    </Button>
  );
};
