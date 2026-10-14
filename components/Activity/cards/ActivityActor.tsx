'use client';

import { FC, ReactNode } from 'react';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTimeAgoShort } from '@/utils/date';
import { ActivityActionText } from './ActivityActionText';
import { ActivityAuthorSummary } from './ActivityAuthorSummary';
import type { ActivityActionLine } from '../lib/activityDisplay.utils';
import type { AuthorProfile } from '@/types/authorProfile';

const MAX_STACKED_AVATARS = 3;

interface ActivityActorProps {
  /** Whoever acted: one person, or several (co-authors, funders) shown as a stack. */
  authors: AuthorProfile[];
  /** What they did, read as part of the byline. */
  action: ActivityActionLine;
  timestamp: string;
  /** The actor wrote the work the card is about. */
  isAuthor?: boolean;
  /** The card's ⋯ menu, pinned to the top-right corner. */
  menu?: ReactNode;
  /** The rest of the card, set in the column beside the avatar, under the byline. */
  children?: ReactNode;
}

/**
 * Who did what, and when, with the rest of the card beside them: the avatar keeps a
 * column of its own, and the byline and everything under it share the column to its
 * right. Several people overlap across the byline's row instead, and what's under
 * them keeps the same column. The byline carries the name with its badges and the
 * time on one line, and the action under it. Kept to the byline's quieter type so
 * the card's content, below it, is the first thing that reads as someone's words.
 */
export const ActivityActor: FC<ActivityActorProps> = ({
  authors,
  action,
  timestamp,
  isAuthor = false,
  menu,
  children,
}) => {
  const [lead] = authors;
  if (!lead) return null;

  const isGroup = authors.length > 1;

  const header = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="min-w-0 flex-1">
        {isGroup ? (
          // Several names wrap, so the time runs on after the last one instead of
          // sitting apart in a column of its own.
          <div className="text-[15px] leading-5">
            <ActivityAuthorSummary authors={authors} />{' '}
            <time
              dateTime={timestamp}
              title={new Date(timestamp).toLocaleString()}
              className="whitespace-nowrap text-[13px] text-gray-500"
            >
              · {formatTimeAgoShort(timestamp)}
            </time>
          </div>
        ) : (
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1 text-[15px] leading-5">
            {/* The name is never cut: one too long for the line wraps rather than
                truncating. */}
            <span className="max-w-full">
              <ActivityAuthorSummary authors={authors} />
            </span>
            {isAuthor && <AuthorBadge size="sm" className="flex-shrink-0 self-center" />}
            <span className="flex items-baseline text-[13px] text-gray-500">
              <Tooltip
                content={new Date(timestamp).toLocaleString()}
                wrapperClassName="flex h-auto w-fit flex-shrink-0"
              >
                <time dateTime={timestamp} className="cursor-default whitespace-nowrap">
                  · {formatTimeAgoShort(timestamp)}
                </time>
              </Tooltip>
            </span>
          </div>
        )}
        <ActivityActionText line={action} className="mt-0.5" />
      </div>

      {menu && <div className="-mr-1.5 -mt-1 flex-shrink-0">{menu}</div>}
    </div>
  );

  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3">
      {isGroup ? (
        <div className="col-span-2 flex items-start gap-3">
          <AvatarStack
            items={authors.map((author) => ({
              src: author.profileImage || '',
              alt: author.fullName || 'User',
              authorId: author.id || undefined,
            }))}
            size="md"
            maxItems={MAX_STACKED_AVATARS}
            spacing={-16}
            showLabel={false}
            className="flex-shrink-0"
          />
          {header}
        </div>
      ) : (
        <>
          <Avatar
            src={lead.profileImage}
            alt={lead.fullName || 'User'}
            size="md"
            authorId={lead.id}
          />
          {header}
        </>
      )}

      {children && <div className="col-start-2">{children}</div>}
    </div>
  );
};
