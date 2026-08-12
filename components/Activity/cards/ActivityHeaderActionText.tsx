'use client';

import { FC } from 'react';
import Link from 'next/link';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import type { ActivityHeaderMessage } from '../lib/activityDisplay.utils';

interface ActivityHeaderActionTextProps {
  message: ActivityHeaderMessage;
  className?: string;
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
}) => {
  const { actor, verb, target } = message;

  return (
    <span className={className}>
      <AuthorName id={actor.id} profileUrl={actor.profileUrl} fullName={actor.fullName} />
      <span className="text-gray-500"> {verb}</span>
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
    </span>
  );
};
