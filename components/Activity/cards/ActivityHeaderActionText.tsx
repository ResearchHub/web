'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
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
}

function AuthorName({
  id,
  profileUrl,
  fullName,
}: {
  id?: number;
  profileUrl: string;
  fullName?: string | null;
}) {
  const name = <span className="font-medium text-gray-900">{fullName || 'Unknown'}</span>;

  if (!id) {
    return name;
  }

  return (
    <AuthorTooltip authorId={id} placement="bottom">
      <Link href={profileUrl} className="font-medium text-gray-900 hover:text-primary-600">
        {fullName || 'Unknown'}
      </Link>
    </AuthorTooltip>
  );
}

export const ActivityHeaderActionText: FC<ActivityHeaderActionTextProps> = ({
  message,
  className,
  stacked = false,
  trailing,
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
          <AuthorName id={actor.id} profileUrl={actor.profileUrl} fullName={actor.fullName} />
        </span>
        <span className="block">{action}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <AuthorName id={actor.id} profileUrl={actor.profileUrl} fullName={actor.fullName} />
      {action}
    </span>
  );
};
