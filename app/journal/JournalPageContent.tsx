'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedSortDropdown } from '@/components/Feed/FeedSortDropdown';
import { useFeed } from '@/hooks/useFeed';
import { JournalV2FeedEntryItem } from '@/components/Journal/JournalV2FeedEntryItem';

type JournalSortOption = 'newest' | 'peer_review_score';

const JOURNAL_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Review score', value: 'peer_review_score' },
];

function getJournalSort(value: string | null): JournalSortOption {
  return value === 'peer_review_score' ? value : 'newest';
}

export function JournalPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const journalSort = getJournalSort(searchParams.get('sort'));

  const changeJournalSort = (sort: JournalSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed('journal', {
    endpoint: 'journal_v2_feed',
    ordering: journalSort,
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      filters={
        <div className="mb-2 mt-2 flex items-center justify-end sm:mt-4">
          <FeedSortDropdown
            options={JOURNAL_SORT_OPTIONS}
            value={journalSort}
            onChange={(sort) => changeJournalSort(getJournalSort(sort))}
          />
        </div>
      }
      ordering={journalSort}
      skeletonVariant="registeredReport"
      activeTab="journal"
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No Registered Reports yet</p>
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
