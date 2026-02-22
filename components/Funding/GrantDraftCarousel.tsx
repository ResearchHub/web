'use client';

import { FC } from 'react';
import Link from 'next/link';
import type { Note } from '@/types/note';
import { cn } from '@/utils/styles';
import { MoreHorizontal, Pencil, UserPlus } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { getShortTitle } from './GrantCarousel';

interface GrantDraftCarouselProps {
  note: Note;
  orgSlug: string;
  className?: string;
  onInviteExperts?: () => void;
  onEditGrant?: () => void;
}

export const GrantDraftCarousel: FC<GrantDraftCarouselProps> = ({
  note,
  orgSlug,
  className,
  onInviteExperts,
  onEditGrant,
}) => {
  const noteHref = `/notebook/${orgSlug}/${note.id}`;

  return (
    <section className={cn('py-5', className)}>
      {/* Title + draft badge */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href={noteHref} className="group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
            {getShortTitle(note.title || 'Untitled Grant')}
          </h2>
        </Link>
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
        <button
          onClick={onInviteExperts}
          className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invite experts
        </button>
        <BaseMenu
          align="end"
          trigger={
            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
              <MoreHorizontal className="h-4.5 w-4.5" />
            </button>
          }
        >
          <BaseMenuItem onSelect={onEditGrant}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit opportunity
          </BaseMenuItem>
        </BaseMenu>
      </div>

      {/* CTA body */}
      <div className="mt-4">
        <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Finish editing this opportunity to invite experts
            </p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={onEditGrant}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Edit opportunity
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
