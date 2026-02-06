'use client';

import { FC, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { ProposalCard } from './ProposalCard';

const PAGE_SIZE = 20;

interface ProposalListProps {
  readonly entries: FeedEntry[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  readonly emptyState?: React.ReactNode;
}

export const ProposalList: FC<ProposalListProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  emptyState,
}) => {
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Check if we can load more - if entries < PAGE_SIZE, we've loaded everything
  const canLoadMore = hasMore && entries.length >= PAGE_SIZE;

  useEffect(() => {
    if (inView && canLoadMore && !isLoading) {
      loadMore();
    }
  }, [inView, canLoadMore, isLoading, loadMore]);

  // Show empty state
  if (!isLoading && entries.length === 0) {
    return emptyState || null;
  }

  return (
    <div className="space-y-4">
      {/* Initial loading skeletons */}
      {isLoading && entries.length === 0 && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProposalCardSkeleton key={i} />
          ))}
        </>
      )}

      {/* Proposal cards */}
      {entries.map((entry) => (
        <ProposalCard key={entry.id} entry={entry} />
      ))}

      {/* Infinite scroll sentinel */}
      {!isLoading && canLoadMore && <div ref={loadMoreRef} className="h-10" />}

      {/* Loading more skeletons */}
      {isLoading && entries.length > 0 && (
        <>
          {Array.from({ length: 2 }).map((_, i) => (
            <ProposalCardSkeleton key={`loading-${i}`} />
          ))}
        </>
      )}
    </div>
  );
};

function ProposalCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full" />
      </div>

      {/* Stats */}
      <div className="h-4 bg-gray-200 rounded w-48 mb-3" />

      {/* Latest */}
      <div className="h-4 bg-gray-200 rounded w-full mb-3" />

      {/* Contribution */}
      <div className="h-4 bg-gray-200 rounded w-32" />
    </div>
  );
}
