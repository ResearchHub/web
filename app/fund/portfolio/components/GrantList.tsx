'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { GrantCard } from './GrantCard';

interface GrantListProps {
  readonly entries: FeedEntry[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  readonly emptyState: ReactNode;
}

export const GrantList: FC<GrantListProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  emptyState,
}) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Don't try to load more if we have fewer entries than page size (means we got everything)
  const PAGE_SIZE = 20;
  const canLoadMore = hasMore && entries.length >= PAGE_SIZE;

  useEffect(() => {
    if (inView && canLoadMore && !isLoading) {
      loadMore();
    }
  }, [inView, canLoadMore, isLoading, loadMore]);

  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GrantCardSkeleton key={`grant-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (!isLoading && entries.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <GrantCard key={entry.id} entry={entry} />
      ))}

      {/* Infinite scroll sentinel - only render when not loading and can load more */}
      {!isLoading && canLoadMore && <div ref={loadMoreRef} className="h-10" />}

      {/* Loading more skeletons */}
      {isLoading && entries.length > 0 && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <GrantCardSkeleton key={`grant-loading-skeleton-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
};

function GrantCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-28 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}
