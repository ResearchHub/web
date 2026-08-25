'use client';

import { FC, useEffect, useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { ProposalFeedItem } from './ProposalFeedItem';
import { useFundraises } from '@/contexts/FundraiseContext';
import { cn } from '@/utils/styles';

interface ProposalFeedProps {
  className?: string;
  isActive?: boolean;
}

export const ProposalFeed: FC<ProposalFeedProps> = ({ className, isActive = true }) => {
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    sortBy,
    statusFilter,
    activate,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useFundraises();

  useEffect(() => {
    activate();
  }, [activate]);

  const persistedFilters = useMemo(() => ({ sortBy, statusFilter }), [sortBy, statusFilter]);

  return (
    <div className={cn('', className)}>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        skeletonVariant="fundraise"
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        activeTab={restorationTab}
        restoredScrollPosition={isActive ? restoredScrollPosition : null}
        page={page}
        lastClickedEntryId={isActive ? (lastClickedEntryId ?? undefined) : undefined}
        persistedFilters={persistedFilters}
        noEntriesElement={
          <div className="py-12 text-center">
            <p className="text-gray-500">No proposals submitted yet</p>
          </div>
        }
      />
    </div>
  );
};
