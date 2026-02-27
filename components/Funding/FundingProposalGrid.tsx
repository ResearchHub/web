'use client';

import { FC, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useFundraises } from '@/contexts/FundraiseContext';
import { cn } from '@/utils/styles';

interface FundingProposalGridProps {
  className?: string;
}

const SKELETON_COUNT = 5;

export const FundingProposalGrid: FC<FundingProposalGridProps> = ({ className }) => {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useFundraises();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <div className={cn('', className)}>
      <PageHeader title="Fund Research" className="mb-8" />

      <div className="flex flex-col gap-3">
        {isLoading ? (
          [...Array(SKELETON_COUNT)].map((_, i) => <ProposalCardSkeleton key={i} />)
        ) : entries.length > 0 ? (
          <>
            {entries.map((entry) => (
              <FundingProposalCard key={entry.id} entry={entry} showActions={true} />
            ))}
            {isLoadingMore &&
              [...Array(3)].map((_, i) => <ProposalCardSkeleton key={`more-${i}`} />)}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No proposals found</p>
          </div>
        )}
      </div>

      {!isLoading && hasMore && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
};
