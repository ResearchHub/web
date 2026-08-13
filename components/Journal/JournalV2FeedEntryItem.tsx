'use client';

import { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { FeedItemRegisteredReport } from '@/components/Feed/items/FeedItemRegisteredReport';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { getUnifiedDocumentId } from '@/types/analytics';

interface JournalV2FeedEntryItemProps {
  entry: FeedEntry;
  index: number;
  feedOrdering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
}

export const JournalV2FeedEntryItem: FC<JournalV2FeedEntryItemProps> = ({
  entry,
  index,
  feedOrdering,
  registerVisibleItem,
  unregisterVisibleItem,
  getVisibleItems,
}) => {
  const unifiedDocumentId = getUnifiedDocumentId(entry);

  const { ref } = useInView({
    threshold: 0,
    rootMargin: '50px',
    onChange: (inView) => {
      if (!unifiedDocumentId) return;
      if (inView) {
        registerVisibleItem(index, unifiedDocumentId);
      } else {
        unregisterVisibleItem(index, unifiedDocumentId);
      }
    },
  });

  const visibleItems = unifiedDocumentId ? getVisibleItems(unifiedDocumentId) : [];
  const { handleFeedItemClick } = useFeedItemAnalyticsTracking({
    entry,
    feedPosition: index + 1,
    feedOrdering,
    impression: visibleItems.length > 0 ? visibleItems : undefined,
  });

  const isRegisteredReport = (entry.content as FeedPostContent).postType === 'REGISTERED_REPORT';

  return (
    <div ref={ref} className={index === 0 ? undefined : 'mt-8'}>
      {isRegisteredReport ? (
        <FeedItemRegisteredReport entry={entry} onFeedItemClick={handleFeedItemClick} />
      ) : (
        <FeedItemFundraise entry={entry} onFeedItemClick={handleFeedItemClick} />
      )}
    </div>
  );
};
