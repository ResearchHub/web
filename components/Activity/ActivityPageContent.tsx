'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { ActivityCard } from './cards/ActivityCard';
import { ActivityCardSkeleton } from './cards/ActivityCardSkeleton';
import { ActivityCommentGroupCard } from './cards/ActivityCommentGroupCard';
import { ActivityFundingGroupCard } from './cards/ActivityFundingGroupCard';
import { groupActivityRows } from './lib/activityGrouping.utils';
import { useActivityFeeds } from '@/contexts/ActivityFeedContext';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { getFeedKey } from '@/contexts/NavigationContext';

export function ActivityPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    activate,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useActivityFeeds();

  useEffect(() => {
    activate();
  }, [activate]);

  const feedKey = useMemo(() => {
    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }
    return getFeedKey({
      pathname,
      tab: restorationTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }, [pathname, restorationTab, searchParams]);

  const rows = useMemo(() => groupActivityRows(entries), [entries]);

  // Tracking stays on the raw entries so the persisted state is grouping-agnostic.
  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId: lastClickedEntryId ?? undefined,
  });

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
  });

  return (
    <div>
      {rows.map((row) => {
        switch (row.kind) {
          case 'funding-group':
            return <ActivityFundingGroupCard key={row.key} row={row} />;
          case 'comment-group':
            return <ActivityCommentGroupCard key={row.key} row={row} />;
          default:
            return <ActivityCard key={row.key} entry={row.entry} />;
        }
      })}

      {(isLoading || isLoadingMore) &&
        [...Array(6)].map((_, i) => <ActivityCardSkeleton key={i} />)}

      {!isLoading && !isLoadingMore && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No activity found</p>
        </div>
      )}

      {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}
