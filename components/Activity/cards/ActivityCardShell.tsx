'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface ActivityCardShellProps {
  /** The entry the card is anchored to, for scroll restoration. */
  entryId: string;
  /** Every entry a grouped card stands for, so restoration can find absorbed ones too. */
  entryIds?: string[];
  className?: string;
  children: ReactNode;
}

/** A hairline between the byline and the actor's own words, across the column beside the avatar. */
export const ACTIVITY_CONTENT_DIVIDER = 'mt-3 border-t border-gray-200/70 pt-3';

/**
 * The hairline under each activity row: the row's full width on a phone, and from
 * the tablet breakpoint up starting where the column beside the avatar does (a
 * 40px avatar and a 12px gap), so it never crosses an avatar.
 */
export const ACTIVITY_ROW_DIVIDER =
  'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gray-200 last:after:hidden tablet:after:left-[52px]';

/**
 * One activity row: no box around it, just a hairline under it that separates it
 * from the next. The last row in a list goes without.
 */
export const ActivityCardShell: FC<ActivityCardShellProps> = ({
  entryId,
  entryIds,
  className,
  children,
}) => (
  <article
    className={cn(ACTIVITY_ROW_DIVIDER, 'py-4', className)}
    data-entry-id={entryId}
    data-entry-ids={entryIds?.join(' ')}
    data-testid="activity-card"
  >
    {children}
  </article>
);
