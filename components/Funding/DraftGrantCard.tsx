'use client';

import { FC } from 'react';
import type { Note } from '@/types/note';
import { cn } from '@/utils/styles';
import { Pencil, MoreHorizontal, Trash2 } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { getShortTitle } from './GrantCarousel';

interface DraftGrantCardProps {
  note: Note;
  className?: string;
  onContinueEditing: () => void;
  onDelete: () => void;
}

export const DraftGrantCard: FC<DraftGrantCardProps> = ({
  note,
  className,
  onContinueEditing,
  onDelete,
}) => {
  const title = getShortTitle(note.title || 'Untitled Grant');

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 h-full',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 flex-shrink-0">
          Draft
        </span>
        <BaseMenu
          align="end"
          trigger={
            <button className="p-1 -m-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
        >
          <BaseMenuItem onSelect={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete draft
          </BaseMenuItem>
        </BaseMenu>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mt-2">
        {title}
      </h3>

      {note.organization?.name && (
        <span className="text-xs text-gray-500 mt-1 truncate">{note.organization.name}</span>
      )}

      <div className="flex-1" />

      <button
        onClick={onContinueEditing}
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5" />
        Continue editing
      </button>
    </div>
  );
};
