'use client';

import { useEffect } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { useGrantFeed } from '@/contexts/GrantFeedContext';

export function FeedV2GrantsPageContent() {
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
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No open awards right now</p>
        </div>
      }
    />
  );
}
