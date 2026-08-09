'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { getFeedKey } from '@/contexts/NavigationContext';

export function FundActivityPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useActivityFeed({});

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
      {entries.map((entry) => (
        <ActivityCardFull key={entry.id} entry={entry} />
      ))}

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
