'use client';

import { useEffect } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { useGrantFeed } from '@/contexts/GrantFeedContext';

export function FundGrantsPageContent() {
  const { entries, isLoading, hasMore, loadMore, sortBy, setSortBy, activate } = useGrantFeed();

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
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No open awards right now</p>
        </div>
      }
    />
  );
}
