'use client';

import { type ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { ActivityCardSkeleton } from './cards/ActivityCardSkeleton';

interface ActivityFeedListProps {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void | Promise<void>;
  isEmpty: boolean;
  skeletonCount?: number;
  children: ReactNode;
}

/**
 * Shared activity infinite-scroll list: skeletons, empty state, and load-more sentinel.
 * Call sites own entry/row rendering (including grouping).
 */
export function ActivityFeedList({
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  isEmpty,
  skeletonCount = 6,
  children,
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
      {children}

      {(isLoading || isLoadingMore) &&
        [...Array(skeletonCount)].map((_, i) => <ActivityCardSkeleton key={i} />)}

      {!isLoading && !isLoadingMore && isEmpty && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No activity found</p>
        </div>
      )}

      {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}
