'use client';

import { useState } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';
import { JournalV2FeedEntryItem } from '@/components/Journal/JournalV2FeedEntryItem';
import {
  JournalV2SortAndFilters,
  type JournalSortOption,
} from '@/components/Journal/JournalV2SortAndFilters';

export function JournalNewPageContent() {
  const [journalSort, setJournalSort] = useState<JournalSortOption>('best');

  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed('all', {
    endpoint: 'journal_v2_feed',
    ordering: journalSort,
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      filters={<JournalV2SortAndFilters sortBy={journalSort} onSortChange={setJournalSort} />}
      ordering={journalSort}
      activeTab="journal-new"
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No journal entries yet</p>
        </div>
      }
      renderEntry={({
        entry,
        index,
        ordering,
        registerVisibleItem,
        unregisterVisibleItem,
        getVisibleItems,
      }) => (
        <JournalV2FeedEntryItem
          entry={entry}
          index={index}
          feedOrdering={ordering}
          registerVisibleItem={registerVisibleItem}
          unregisterVisibleItem={unregisterVisibleItem}
          getVisibleItems={getVisibleItems}
        />
      )}
    />
  );
}
