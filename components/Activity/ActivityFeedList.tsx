'use client';

import { useInView } from 'react-intersection-observer';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeleton } from '@/components/Activity/ActivityCardSkeleton';
import type { FeedEntry } from '@/types/feed';

interface ActivityFeedListProps {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  skeletonCount?: number;
  emptyMessage?: string;
}

export function ActivityFeedList({
  entries,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  skeletonCount = 6,
  emptyMessage = 'No activity found',
}: ActivityFeedListProps) {
  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
  });

  return (
    <div>
      {entries.map((entry) => (
        <ActivityCardFull key={entry.id} entry={entry} />
      ))}

      {(isLoading || isLoadingMore) &&
        [...Array(skeletonCount)].map((_, i) => <ActivityCardSkeleton key={i} />)}

      {!isLoading && !isLoadingMore && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}
