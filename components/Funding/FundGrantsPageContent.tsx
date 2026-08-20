'use client';

import { useEffect, useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { useGrantFeed } from '@/contexts/GrantFeedContext';

export function FundGrantsPageContent() {
  const {
    entries,
    isLoading,
    hasMore,
    page,
    loadMore,
    sortBy,
    setSortBy,
    activate,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useGrantFeed();

  useEffect(() => {
    activate();
  }, [activate]);

  const persistedFilters = useMemo(() => ({ sortBy }), [sortBy]);

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      filters={<GrantSortAndFilters sortBy={sortBy} onSortChange={setSortBy} />}
      skeletonVariant="grant"
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      activeTab={restorationTab}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      persistedFilters={persistedFilters}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No open awards right now</p>
        </div>
      }
    />
  );
}
