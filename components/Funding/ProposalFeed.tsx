'use client';

import { FC, useEffect } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { ProposalFeedItem } from './ProposalFeedItem';
import { useFundraises } from '@/contexts/FundraiseContext';
import { cn } from '@/utils/styles';

interface ProposalFeedProps {
  className?: string;
}

export const ProposalFeed: FC<ProposalFeedProps> = ({ className }) => {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore, activate, sortBy } =
    useFundraises();

  useEffect(() => {
    activate();
  }, [activate]);

  return (
    <div className={cn('', className)}>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        ordering={sortBy}
        skeletonVariant="proposalWork"
        renderEntry={({
          entry,
          index,
          ordering,
          registerVisibleItem,
          unregisterVisibleItem,
          getVisibleItems,
        }) => (
          <ProposalFeedItem
            entry={entry}
            index={index}
            ordering={ordering}
            registerVisibleItem={registerVisibleItem}
            unregisterVisibleItem={unregisterVisibleItem}
            getVisibleItems={getVisibleItems}
          />
        )}
        noEntriesElement={
          <div className="py-12 text-center">
            <p className="text-gray-500">No proposals submitted yet</p>
          </div>
        }
      />
    </div>
  );
};
