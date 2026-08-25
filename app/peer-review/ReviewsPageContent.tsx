'use client';

import { BountyFeedItem } from '@/components/Bounty/BountyFeedItem';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedSortDropdown } from '@/components/Feed/FeedSortDropdown';
import { useBounties } from '@/hooks/useBounties';

const SORT_OPTIONS = [
  { label: 'Best', value: 'personalized' },
  { label: 'Newest', value: '-created_date' },
  { label: 'Expiring soon', value: 'expiration_date' },
  { label: 'RSC amount', value: '-total_amount' },
];

export function ReviewsPageContent() {
  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    handleSortChange,
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
      filters={
        <div className="mb-2 mt-2 flex items-center justify-end sm:mt-4">
          <FeedSortDropdown options={SORT_OPTIONS} value={sort} onChange={handleSortChange} />
        </div>
      }
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
