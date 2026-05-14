'use client';

import { FC } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Embed } from '@/components/Embed';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { PostCardPost } from '../lib/postCard';

interface EmbeddedPostCardProps {
  data: PostCardPost;
  /**
   * When true (and `data.relatedWork` is set), renders a small "From: <title>"
   * link below the embed pointing to the source document. Off by default so
   * the document-scoped surfaces (e.g. the proposal page) don't duplicate
   * context the viewer already has.
   */
  showRelatedWork?: boolean;
  /**
   * When true, renders a small "Update" badge in the top-right of the card.
   * Intended for mixed feeds (e.g. the funder dashboard) where viewers need
   * to tell post cards apart from review cards at a glance.
   */
  showTypeBadge?: boolean;
  className?: string;
}

const UpdateBadge: FC = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
    <MessageSquare size={10} />
    Update
  </span>
);

/**
 * Pure "author post" card: author header + optional snippet + embed + optional
 * source link. Knows nothing about comments, documents, or composers — it
 * just renders the `PostCardPost` view-model and surfaces an `onEdit`
 * callback when one is provided.
 */
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
      <header className="flex min-w-0 items-center gap-2">
        <Avatar
          src={author.profileImage}
          alt={authorLabel}
          size="xs"
          authorId={author.authorProfileId}
        />
        <span className="truncate text-sm font-medium text-gray-900">{authorLabel}</span>
        <span className="shrink-0 whitespace-nowrap text-xs text-gray-500">· {dateLabel}</span>
        {showHeaderRight && (
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
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
