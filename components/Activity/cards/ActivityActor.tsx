'use client';

import { FC, ReactNode } from 'react';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { Avatar } from '@/components/ui/Avatar';
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
  /**
   * The card's action row. It shares the column beside the avatar from the tablet
   * breakpoint up; on a phone that column is too narrow for votes, share, save and
   * a labelled button at once, so the row runs under the avatar too.
   */
  footer?: ReactNode;
}

/**
 * Who did what, and when, with the rest of the card beside them: the avatar keeps a
 * column of its own, and the byline and everything under it share the column to its
 * right (all but the action row, on a phone; see `footer`). The byline carries the
 * name with its badges and the time on one line, and the action under it. Kept to
 * the byline's quieter type so the card's content, below it, is the first thing
 * that reads as someone's words.
 */
export const ActivityActor: FC<ActivityActorProps> = ({
  authors,
  action,
  timestamp,
  isAuthor = false,
  menu,
  children,
  footer,
}) => {
  const [lead] = authors;
  if (!lead) return null;

  const isGroup = authors.length > 1;

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
      {isGroup ? (
        // Stacked down the column rather than across it, so the column stays one
        // avatar wide. The lead sits on top.
        <div className="flex flex-col">
          {authors.slice(0, MAX_STACKED_AVATARS).map((author, index) => (
            <div
              key={author.id ?? index}
              className="relative -mt-4 first:mt-0"
              style={{ zIndex: MAX_STACKED_AVATARS - index }}
            >
              <Avatar
                src={author.profileImage}
                alt={author.fullName || 'User'}
                size="md"
                authorId={author.id}
                className="ring-2 ring-white"
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Avatar
            src={lead.profileImage}
            alt={lead.fullName || 'User'}
            size="md"
            authorId={lead.id}
          />
        </div>
      )}

      <div className="min-w-0">
        <div className="flex items-start gap-3">
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

        {children}
      </div>

      {footer && <div className="col-span-2 tablet:col-span-1 tablet:col-start-2">{footer}</div>}
    </div>
  );
};
