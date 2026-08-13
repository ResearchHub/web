'use client';

import {
  RecentlyVisitedCard,
  RecentlyVisitedCardSkeleton,
  useRecentlyVisited,
} from './RecentlyVisitedCard';

export function FundSidebar() {
  const { pages, clear, isHydrated } = useRecentlyVisited();

  if (!isHydrated) {
    return <RecentlyVisitedCardSkeleton className="w-full" />;
  }

  if (pages.length === 0) {
    return null;
  }

  return <RecentlyVisitedCard pages={pages} clear={clear} className="w-full" />;
}
