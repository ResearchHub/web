'use client';

import { FundingPowerCard } from './FundingPowerCard';
import { RecentlyVisitedCard, useRecentlyVisited } from './RecentlyVisitedCard';
import { cn } from '@/utils/styles';

export function FundSidebar() {
  const recentlyVisited = useRecentlyVisited();
  const showsRecentlyVisited = recentlyVisited.pages.length > 0;

  return (
    <div>
      <FundingPowerCard className="w-full" />
      {showsRecentlyVisited && (
        <RecentlyVisitedCard
          {...recentlyVisited}
          className={cn('w-full', 'mt-4 border-t border-gray-200/80 pt-4')}
        />
      )}
    </div>
  );
}
