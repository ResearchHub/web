'use client';

import { useEffect, useMemo } from 'react';
import { ActivityFeedList } from './ActivityFeedList';
import { ActivityRow } from './ActivityRow';
import { groupActivityRows } from './lib/activityGrouping.utils';
import { useActivityFeeds } from '@/contexts/ActivityFeedContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';

export function ActivityPageContent() {
  const scrollContainerRef = useScrollContainer();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    activate,
    feedKey,
    restoredScrollPosition,
    hasSavedScrollPosition,
    lastClickedEntryId,
  } = useActivityFeeds();

  useEffect(() => {
    activate();
  }, [activate]);

  // The scroll container belongs to PageLayout and on a fresh visit, it is not at the top of the page.
  // This is bad because the FundingPowerCard gets hidden.
  useEffect(() => {
    if (!hasSavedScrollPosition && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [hasSavedScrollPosition, scrollContainerRef]);

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

  return (
    <ActivityFeedList
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      isEmpty={entries.length === 0}
    >
      {rows.map((row) => (
        <ActivityRow key={row.key} row={row} />
      ))}
    </ActivityFeedList>
  );
}
