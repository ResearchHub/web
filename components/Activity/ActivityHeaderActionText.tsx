'use client';

import { FC } from 'react';
import Link from 'next/link';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import type { ActivityHeaderMessage } from './lib/feedEntryAdapters';

interface ActivityHeaderActionTextProps {
  message: ActivityHeaderMessage;
  className?: string;
}

export const ActivityHeaderActionText: FC<ActivityHeaderActionTextProps> = ({
  message,
  className,
}) => {
  const { actor, verb, target } = message;

  return (
    <span className={className}>
      <AuthorTooltip authorId={actor.id} placement="bottom">
        <Link href={actor.profileUrl} className="font-medium text-gray-900 hover:text-primary-600">
          {actor.fullName || 'Unknown'}
        </Link>
      </AuthorTooltip>
      <span className="text-gray-500"> {verb}</span>
      {target && (
        <>
          {' '}
          <AuthorTooltip authorId={target.author.id} placement="bottom">
            <Link
              href={target.author.profileUrl}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {target.author.fullName || 'Unknown'}
            </Link>
          </AuthorTooltip>
          {target.suffix && <span className="font-medium text-gray-900">{target.suffix}</span>}
        </>
      )}
    </span>
  );
};
