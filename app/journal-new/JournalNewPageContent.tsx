'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';
import { JournalV2FeedEntryItem } from '@/components/Journal/JournalV2FeedEntryItem';

type JournalSortOption = 'best' | 'newest' | 'peer_review_score';

const JOURNAL_SORT_OPTIONS = [
  { label: 'Best', value: 'best' },
  { label: 'Newest', value: 'newest' },
  { label: 'Review score', value: 'peer_review_score' },
] as const;

function getJournalSort(value: string | null): JournalSortOption {
  return value === 'newest' || value === 'peer_review_score' ? value : 'best';
}

export function JournalNewPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const journalSort = getJournalSort(searchParams.get('sort'));

  const changeJournalSort = (sort: JournalSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === 'best') {
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
  } = useFeed('journal-new', {
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
          <select
            aria-label="Sort journal entries"
            value={journalSort}
            onChange={(event) => changeJournalSort(getJournalSort(event.target.value))}
            className="cursor-pointer bg-transparent pr-1 text-xs font-medium text-gray-700 outline-none transition-colors hover:text-gray-900 sm:text-sm"
          >
            {JOURNAL_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      }
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
