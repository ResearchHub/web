'use client';

import { BountyFeedItem } from '@/components/Bounty/BountyFeedItem';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useBounties } from '@/hooks/useBounties';

export function ReviewsPageContent() {
  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useBounties();

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      ordering={sort}
      skeletonVariant="proposalWork"
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      renderEntry={({
        entry,
        index,
        ordering,
        registerVisibleItem,
        unregisterVisibleItem,
        getVisibleItems,
      }) => (
        <BountyFeedItem
          entry={entry}
          index={index}
          ordering={ordering}
          registerVisibleItem={registerVisibleItem}
          unregisterVisibleItem={unregisterVisibleItem}
          getVisibleItems={getVisibleItems}
        />
      )}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-500">No open peer-review bounties</p>
        </div>
      }
    />
  );
}
