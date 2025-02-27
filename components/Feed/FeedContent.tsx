'use client';

import { FC, ReactNode } from 'react';
import { FeedItem } from './FeedItem';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { FeedEntry } from '@/types/feed';

interface FeedContentProps {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs: ReactNode;
}

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
}) => {
  return (
    <>
      {header && <div className="pt-4 pb-7">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs}

        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
          ) : (
            entries.map((entry, index) => (
              <FeedItem key={entry.id} entry={entry} isFirst={index === 0} />
            ))
          )}
        </div>

        {!isLoading && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};
