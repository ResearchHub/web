'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/utils/styles';
import { isVerifiedAuthor, type ActivityHeaderMessage } from '../lib/activityDisplay.utils';
import type { AuthorProfile } from '@/types/authorProfile';
import { ActivityAuthorSummary } from './ActivityGroupHeader';

interface ActivityHeaderActionTextProps {
  message: ActivityHeaderMessage;
  authors?: AuthorProfile[];
  className?: string;
  /** Author on its own line; verb/target on the line below. */
  stacked?: boolean;
  /** Extra content (e.g. amount badges) rendered after the action text. */
  trailing?: ReactNode;
  /** Show AuthorBadge next to the actor when they authored the work. */
  isAuthor?: boolean;
}

function AuthorName({
  author,
  showAuthorBadge,
  truncate = false,
}: {
  author: AuthorProfile;
  showAuthorBadge?: boolean;
  /**
   * On a line of its own with no room to wrap: the name gives way with an
   * ellipsis so the badge after it stays whole, instead of the badge being
   * cut off at the edge.
   */
  truncate?: boolean;
}) {
  const wrapperClass = cn('inline-flex items-center', truncate && 'min-w-0 max-w-full');
  const nameClass = cn('font-semibold text-gray-900', truncate && 'min-w-0 truncate');
  const { id, profileUrl, fullName } = author;
  const badges = (
    <>
      {isVerifiedAuthor(author) && (
        <VerifiedBadge size="sm" showTooltip className="ml-1 shrink-0" />
      )}
      {showAuthorBadge && <AuthorBadge size="sm" className="ml-1 shrink-0" />}
    </>
  );

  if (!id) {
    return (
      <span className={wrapperClass}>
        <span className={nameClass}>{fullName || 'Unknown'}</span>
        {badges}
      </span>
    );
  }

  return (
    <span className={wrapperClass}>
      <AuthorTooltip authorId={id} placement="bottom">
        <Link href={profileUrl} className={cn(nameClass, 'hover:text-primary-600')}>
          {fullName || 'Unknown'}
        </Link>
      </AuthorTooltip>
      {badges}
    </span>
  );
}

export const ActivityHeaderActionText: FC<ActivityHeaderActionTextProps> = ({
  message,
  authors,
  className,
  stacked = false,
  trailing,
  isAuthor = false,
}) => {
  const { actor, verb, target } = message;
  const authorNames = authors ? (
    <ActivityAuthorSummary authors={authors} />
  ) : (
    <AuthorName author={actor} showAuthorBadge={isAuthor} truncate={stacked} />
  );

  const action = (
    <>
      <span className="text-gray-900">{stacked ? verb : ` ${verb}`}</span>
      {target && (
        <>
          {' '}
          <AuthorName author={target.author} />
          {target.suffix && <span className="text-gray-900">{target.suffix}</span>}
        </>
      )}
      {trailing}
    </>
  );

  if (stacked) {
    return (
      <span className={cn('block', className)}>
        <span className="block truncate">{authorNames}</span>
        <span className="block">{action}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {authorNames}
      {action}
    </span>
  );
};
