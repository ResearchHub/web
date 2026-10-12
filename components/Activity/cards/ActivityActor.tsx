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
}

/**
 * Who did what, and when: the name with its badges, credential and time on one
 * line, and the action under it. On a phone the credential takes a line of its own
 * between them. Kept to the byline's quieter type so the card's content, below it,
 * is the first thing that reads as someone's words.
 */
export const ActivityActor: FC<ActivityActorProps> = ({
  authors,
  action,
  timestamp,
  isAuthor = false,
  menu,
}) => {
  const [lead] = authors;
  if (!lead) return null;

  const isGroup = authors.length > 1;
  const headline = isGroup ? undefined : lead.headline?.trim();

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        {isGroup ? (
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
          />
        ) : (
          <Avatar
            src={lead.profileImage}
            alt={lead.fullName || 'User'}
            size="md"
            authorId={lead.id}
          />
        )}
      </div>

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
            {/* The name is never cut: the credential gives way first, and a name too
                long for the line wraps rather than truncating. */}
            <span className="max-w-full">
              <ActivityAuthorSummary authors={authors} />
            </span>
            {isAuthor && <AuthorBadge size="sm" className="flex-shrink-0 self-center" />}
            <span className="flex min-w-min flex-1 basis-0 items-baseline gap-1 text-[13px] text-gray-500 tablet:min-w-[3.5rem]">
              {headline && (
                <span className="hidden min-w-0 truncate tablet:block">· {headline}</span>
              )}
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
        {headline && (
          // Beside a name on a phone there's only room for a sliver of it.
          <p className="line-clamp-2 text-[13px] leading-[18px] text-gray-500 tablet:hidden">
            {headline}
          </p>
        )}
        <ActivityActionText line={action} className="mt-0.5" />
      </div>

      {menu && <div className="-mr-1.5 -mt-1 flex-shrink-0">{menu}</div>}
    </div>
  );
};
