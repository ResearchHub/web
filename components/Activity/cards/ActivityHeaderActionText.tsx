'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { cn } from '@/utils/styles';
import type { ActivityHeaderMessage } from '../lib/activityDisplay.utils';
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
  id,
  profileUrl,
  fullName,
  showAuthorBadge,
  truncate = false,
}: {
  id?: number;
  profileUrl: string;
  fullName?: string | null;
  showAuthorBadge?: boolean;
  /**
   * On a line of its own with no room to wrap: the name gives way with an
   * ellipsis so the badge after it stays whole, instead of the badge being
   * cut off at the edge.
   */
  truncate?: boolean;
}) {
  const wrapperClass = cn('inline-flex items-center', truncate && 'min-w-0 max-w-full');
  const nameClass = cn('font-medium text-gray-900', truncate && 'min-w-0 truncate');
  const badge = showAuthorBadge ? <AuthorBadge size="sm" className="ml-1 shrink-0" /> : null;

  if (!id) {
    return (
      <span className={wrapperClass}>
        <span className={nameClass}>{fullName || 'Unknown'}</span>
        {badge}
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
      {badge}
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
    <AuthorName
      id={actor.id}
      profileUrl={actor.profileUrl}
      fullName={actor.fullName}
      showAuthorBadge={isAuthor}
      truncate={stacked}
    />
  );

  const action = (
    <>
      <span className="text-gray-500">{stacked ? verb : ` ${verb}`}</span>
      {target && (
        <>
          {' '}
          <AuthorName
            id={target.author.id}
            profileUrl={target.author.profileUrl}
            fullName={target.author.fullName}
          />
          {target.suffix && <span className="text-gray-500">{target.suffix}</span>}
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
