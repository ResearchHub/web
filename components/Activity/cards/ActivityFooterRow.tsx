'use client';

import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

/**
 * Neutral on purpose: a row's one button never takes the primary colour. A touch
 * smaller on a phone, so the longest label still fits beside the votes in the column
 * next to the avatar, and the button doesn't tower over the icons there.
 */
export const ACTIVITY_CTA_CLASS =
  'inline-flex h-9 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-300 bg-white px-3 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-50 tablet:h-10 tablet:px-4 tablet:text-sm';

interface ActivityFooterRowProps {
  /** Votes and the small icon actions beside them. */
  actions: ReactNode;
  /** The row's one button, on the right. */
  cta?: ReactNode;
  className?: string;
}

/**
 * The foot of an activity row: its actions on the left and its one button on the
 * right. Where the column is too narrow for both, as on the narrowest phones, the
 * button wraps onto a line of its own and stays on the right.
 */
export const ActivityFooterRow: FC<ActivityFooterRowProps> = ({ actions, cta, className }) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-2 pt-3', className)}>
    <div className="min-w-0">{actions}</div>
    {cta && <div className="ml-auto">{cta}</div>}
  </div>
);
