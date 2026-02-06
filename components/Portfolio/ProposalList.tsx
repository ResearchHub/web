'use client';

import { ReactNode } from 'react';
import { FeedEntry } from '@/types/feed';
import { InfiniteList } from '@/components/ui/InfiniteList';
import { ProposalCard } from './ProposalCard';
import { SKELETON_CARD_STYLES } from './lib/shared';

interface Props {
  readonly entries: FeedEntry[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  readonly emptyState: ReactNode;
}

export function ProposalList({ entries, isLoading, hasMore, loadMore, emptyState }: Props) {
  return (
    <InfiniteList
      items={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      renderItem={(e) => <ProposalCard entry={e} />}
      renderSkeleton={ProposalSkeleton}
      emptyState={emptyState}
      keyExtractor={(e) => e.id}
      gap="md"
    />
  );
}

function ProposalSkeleton() {
  return (
    <div className={SKELETON_CARD_STYLES}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-48" />
    </div>
  );
}
