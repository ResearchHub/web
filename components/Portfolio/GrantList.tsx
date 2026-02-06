'use client';

import { ReactNode } from 'react';
import { FeedEntry } from '@/types/feed';
import { InfiniteList } from '@/components/ui/InfiniteList';
import { GrantCard } from './GrantCard';
import { SKELETON_CARD_STYLES } from './lib/shared';

interface Props {
  readonly entries: FeedEntry[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  readonly emptyState: ReactNode;
}

export function GrantList({ entries, isLoading, hasMore, loadMore, emptyState }: Props) {
  return (
    <InfiniteList
      items={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      renderItem={(e) => <GrantCard entry={e} />}
      renderSkeleton={GrantSkeleton}
      emptyState={emptyState}
      keyExtractor={(e) => e.id}
    />
  );
}

function GrantSkeleton() {
  return (
    <div className={SKELETON_CARD_STYLES}>
      <div className="flex justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-28 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}
