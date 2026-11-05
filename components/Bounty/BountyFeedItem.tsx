'use client';

import { FC, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { BountyWorkCard } from './BountyWorkCard';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { getUnifiedDocumentId } from '@/types/analytics';
import type { FeedEntry } from '@/types/feed';

interface BountyFeedItemProps {
  entry: FeedEntry;
  index: number;
  ordering?: string;
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
}

/**
 * Feed plumbing for `BountyWorkCard`. `FeedContent`'s `renderEntry` hook
 * bypasses `FeedEntryItem`, which is where impression registration and click
 * analytics normally live, so they are re-wired here.
 */
export const BountyFeedItem: FC<BountyFeedItemProps> = ({
  entry,
  index,
  ordering,
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

  const getImpressions = useCallback(() => {
    if (!unifiedDocumentId) return undefined;
    const visibleItems = getVisibleItems(unifiedDocumentId);

    return visibleItems.length > 0 ? visibleItems : undefined;
  }, [unifiedDocumentId, getVisibleItems]);

  const { handleFeedItemClick } = useFeedItemAnalyticsTracking({
    entry,
    feedPosition: index + 1,
    feedOrdering: ordering,
    impression: getImpressions(),
  });

  return (
    <div ref={ref} className={index === 0 ? undefined : 'mt-6'}>
      <BountyWorkCard entry={entry} onNavigate={handleFeedItemClick} />
    </div>
  );
};
