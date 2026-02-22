'use client';

import { FC } from 'react';
import Link from 'next/link';
import type { Note } from '@/types/note';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { getShortTitle } from './GrantCarousel';

interface GrantDraftCarouselProps {
  note: Note;
  className?: string;
  onContinueEditing?: () => void;
  onDeleteGrant?: () => void;
}

export const GrantDraftCarousel: FC<GrantDraftCarouselProps> = ({
  note,
  className,
  onContinueEditing,
  onDeleteGrant,
}) => {
  return (
    <section className={cn('py-5', className)}>
      {/* Title + draft badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {note.post ? (
          <Link
            href={buildWorkUrl({
              id: note.post.id,
              contentType: note.post.contentType,
              slug: note.post.slug,
            })}
            className="group"
          >
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
              {getShortTitle(note.title || 'Untitled Grant')}
            </h2>
          </Link>
        ) : (
          <h2 className="text-xl font-bold text-gray-900">
            {getShortTitle(note.title || 'Untitled Grant')}
          </h2>
        )}
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
          Draft
        </span>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600 flex-wrap">
        {note.organization?.name && (
          <>
            <span>{note.organization.name}</span>
            <span className="text-gray-300 text-[22px]">&bull;</span>
          </>
        )}
        <span>No proposals</span>
        <span className="ml-auto" />
        <BaseMenu
          align="end"
          trigger={
            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="h-4.5 w-4.5" />
            </button>
          }
        >
          <BaseMenuItem onSelect={onDeleteGrant}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete draft
          </BaseMenuItem>
        </BaseMenu>
      </div>

      {/* CTA zone */}
      <div className="mt-4">
        <button
          onClick={onContinueEditing}
          className="w-full flex items-center justify-center gap-2 py-6 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Continue editing
        </button>
        <div className="flex justify-end mt-2 mr-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            Next step: Invite experts
            <UserPlus className="h-3 w-3" />
          </span>
        </div>
      </div>
    </section>
  );
};
