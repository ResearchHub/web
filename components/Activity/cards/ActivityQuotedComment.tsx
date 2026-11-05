'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { ActivityAuthorSummary } from './ActivityAuthorSummary';
import {
  getCommentExcerpt,
  type ActivityQuotedComment as QuotedComment,
} from '../lib/activityDisplay.utils';

interface ActivityQuotedCommentProps {
  comment: QuotedComment;
  /** Opens the quoted comment in full. Without it the quote is just text. */
  onOpen?: () => void;
  /** How many lines of the quote to show before it trails off. */
  lines?: 2 | 4;
  className?: string;
}

const LINE_CLAMP = { 2: 'line-clamp-2', 4: 'line-clamp-4' } as const;

/**
 * The comment a reply answers, quoted small above the reply so it reads in context.
 * The whole block opens the comment; the author's name keeps its own link.
 */
export const ActivityQuotedComment: FC<ActivityQuotedCommentProps> = ({
  comment,
  onOpen,
  lines = 2,
  className,
}) => {
  const excerpt = getCommentExcerpt(comment);
  const kindLabel = comment.kind === 'review' ? 'peer review' : 'comment';

  return (
    <div
      className={cn(
        'relative rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5',
        onOpen && 'transition-colors hover:border-gray-200 hover:bg-gray-100',
        className
      )}
    >
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 rounded-xl"
          aria-label={`Open ${comment.author.fullName || 'this'}'s ${kindLabel}`}
        />
      )}
      <div className="pointer-events-none relative flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px] text-gray-500">
        <Avatar
          src={comment.author.profileImage}
          alt={comment.author.fullName || 'User'}
          size="xxs"
          disableTooltip
        />
        <span className="pointer-events-auto min-w-0 truncate">
          <ActivityAuthorSummary authors={[comment.author]} />
        </span>
        {comment.kind === 'review' && <span className="flex-shrink-0">· peer review</span>}
      </div>
      {excerpt && (
        <p
          className={cn(
            'pointer-events-none relative mt-1 text-sm leading-5 text-gray-600',
            LINE_CLAMP[lines]
          )}
        >
          {excerpt}
        </p>
      )}
    </div>
  );
};
