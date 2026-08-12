'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ActivityFeedList } from '@/components/Activity/ActivityFeedList';
import { useHomeActivityFeed } from '@/contexts/ActivityFeedContext';
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
    activate,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useHomeActivityFeed();

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

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId: lastClickedEntryId ?? undefined,
  });

  return (
    <ActivityFeedList
      entries={entries}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
    />
  );
}
