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

/** A hairline between the byline and the actor's own words, inset to the card's padding. */
export const ACTIVITY_CONTENT_DIVIDER = 'mt-3 border-t border-gray-200/70 pt-3';

/** The white card every activity row sits in, so each one reads as its own unit. */
export const ActivityCardShell: FC<ActivityCardShellProps> = ({
  entryId,
  entryIds,
  className,
  children,
}) => (
  <article
    className={cn(
      'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]',
      className
    )}
    data-entry-id={entryId}
    data-entry-ids={entryIds?.join(' ')}
    data-testid="activity-card"
  >
    {children}
  </article>
);
