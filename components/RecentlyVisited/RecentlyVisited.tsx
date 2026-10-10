'use client';

import {
  RecentlyVisitedCard,
  RecentlyVisitedCardSkeleton,
  useRecentlyVisited,
} from './RecentlyVisitedCard';

/** The default right sidebar's Recently visited section, once local history is readable. */
export function RecentlyVisited() {
  const { pages, clear, isHydrated } = useRecentlyVisited();

  if (!isHydrated) {
    return <RecentlyVisitedCardSkeleton className="w-full" />;
  }

  if (pages.length === 0) {
    return null;
  }

  return <RecentlyVisitedCard pages={pages} clear={clear} className="w-full" />;
}
