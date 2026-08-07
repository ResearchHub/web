'use client';

import {
  RecentlyVisitedCard,
  RecentlyVisitedCardSkeleton,
  useRecentlyVisited,
} from './RecentlyVisitedCard';
import { FundingPowerCard } from './FundingPowerCard';
import { cn } from '@/utils/styles';

export function FundSidebar() {
  const { pages, clear, isHydrated } = useRecentlyVisited();
  const sectionClassName = cn('w-full', 'mt-4 border-t border-gray-200/80 pt-4');

  return (
    <div>
      <FundingPowerCard className="w-full" />
      {!isHydrated ? (
        <RecentlyVisitedCardSkeleton className={sectionClassName} />
      ) : (
        pages.length > 0 && (
          <RecentlyVisitedCard pages={pages} clear={clear} className={sectionClassName} />
        )
      )}
    </div>
  );
}
