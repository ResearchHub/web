'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { cn } from '@/utils/styles';
import type { ActivityHeaderMessage } from '../lib/activityDisplay.utils';

interface ActivityHeaderActionTextProps {
  message: ActivityHeaderMessage;
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
}: {
  id?: number;
  profileUrl: string;
  fullName?: string | null;
  showAuthorBadge?: boolean;
}) {
  const name = <span className="font-medium text-gray-900">{fullName || 'Unknown'}</span>;
  const badge = showAuthorBadge ? <AuthorBadge size="sm" className="ml-1 shrink-0" /> : null;

  if (!id) {
    return (
      <span className="inline-flex items-center">
        {name}
        {badge}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <AuthorTooltip authorId={id} placement="bottom">
        <Link href={profileUrl} className="font-medium text-gray-900 hover:text-primary-600">
          {fullName || 'Unknown'}
        </Link>
      </AuthorTooltip>
      {badge}
    </span>
  );
}

export const ActivityHeaderActionText: FC<ActivityHeaderActionTextProps> = ({
  message,
  className,
  stacked = false,
  trailing,
  isAuthor = false,
}) => {
  const { actor, verb, target } = message;

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
        <span className="block truncate">
          <AuthorName
            id={actor.id}
            profileUrl={actor.profileUrl}
            fullName={actor.fullName}
            showAuthorBadge={isAuthor}
          />
        </span>
        <span className="block">{action}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <AuthorName
        id={actor.id}
        profileUrl={actor.profileUrl}
        fullName={actor.fullName}
        showAuthorBadge={isAuthor}
      />
      {action}
    </span>
  );
};
