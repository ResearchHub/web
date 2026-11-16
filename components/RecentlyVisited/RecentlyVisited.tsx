'use client';

import {
  RecentlyVisitedCard,
  RecentlyVisitedCardSkeleton,
  useRecentlyVisited,
} from './RecentlyVisitedCard';

interface RecentlyVisitedProps {
  /** Show at most this many visits, fewer than the card's own cap. */
  readonly limit?: number;
}

/**
 * The right sidebar's Recently visited section, once local history is readable.
 * Nothing at all for a viewer who has not visited anything yet.
 */
export function RecentlyVisited({ limit }: RecentlyVisitedProps = {}) {
  const { pages, clear, isHydrated } = useRecentlyVisited();

  if (!isHydrated) {
    return <RecentlyVisitedCardSkeleton rows={limit} className="w-full" />;
  }

  if (pages.length === 0) {
    return null;
  }

  return <RecentlyVisitedCard pages={pages.slice(0, limit)} clear={clear} className="w-full" />;
}
