'use client';

import { FC } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Embed } from '@/components/Embed';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { PostCardPost } from '../lib/postCard';

interface EmbeddedPostCardProps {
  data: PostCardPost;
  showRelatedWork?: boolean;
  showTypeBadge?: boolean;
  className?: string;
}

const UpdateBadge: FC = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-800">
    <Bell size={10} className="text-gray-600" />
    Update
  </span>
);

export const EmbeddedPostCard: FC<EmbeddedPostCardProps> = ({
  data,
  showRelatedWork = false,
  showTypeBadge = false,
  className,
}) => {
  const { author, createdDate, snippet, embed, relatedWork, onEdit } = data;
  const authorLabel = author.fullName || 'Author';
  const dateLabel = formatTimestamp(createdDate, false);
  const showHeaderRight = showTypeBadge || !!onEdit;

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3',
        className
      )}
    >
      <header className="flex min-w-0 items-center gap-2.5">
        <Avatar
          src={author.profileImage}
          alt={authorLabel}
          size="sm"
          authorId={author.authorProfileId}
        />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900">{authorLabel}</span>
          <span className="block text-xs text-gray-500">{dateLabel}</span>
        </div>
        {showHeaderRight && (
          <div className="flex shrink-0 items-center gap-1.5">
            {showTypeBadge && <UpdateBadge />}
            {onEdit && (
              <BaseMenu
                trigger={
                  <button
                    type="button"
                    aria-label="More options"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
              >
                <BaseMenuItem onSelect={onEdit}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </BaseMenuItem>
              </BaseMenu>
            )}
          </div>
        )}
      </header>

      {snippet && (
        <p className="m-0 mt-2 line-clamp-2 text-sm leading-snug text-gray-700">{snippet}</p>
      )}

      <div className="mt-2">
        <Embed embed={embed} />
      </div>

      {showRelatedWork && relatedWork && (
        <Link
          href={relatedWork.href}
          className="mt-2 block truncate text-xs text-gray-500 hover:text-gray-700 hover:underline"
          title={relatedWork.title}
        >
          From: <span className="font-medium text-gray-700">{relatedWork.title}</span>
        </Link>
      )}
    </article>
  );
};
