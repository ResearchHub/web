'use client';

import { FC, useEffect } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFundraises } from '@/contexts/FundraiseContext';
import { cn } from '@/utils/styles';

interface ProposalFeedProps {
  className?: string;
}

export const ProposalFeed: FC<ProposalFeedProps> = ({ className }) => {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore, activate } = useFundraises();

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
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        noEntriesElement={
          <div className="py-12 text-center">
            <p className="text-gray-500">No proposals found</p>
          </div>
        }
      />
    </div>
  );
};
