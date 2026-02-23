'use client';

import { FC } from 'react';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { ProposalSortAndFilters } from './ProposalSortAndFilters';
import { useProposalList } from '@/contexts/ProposalListContext';
import { cn } from '@/utils/styles';

interface FundingProposalGridProps {
  className?: string;
  hideFilters?: boolean;
}

export const FundingProposalGrid: FC<FundingProposalGridProps> = ({
  className,
  hideFilters = false,
}) => {
  const { entries, isLoading, hasMore, loadMore, proposalCount } = useProposalList();

  return (
    <div className={cn('', className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isLoading ? 'Proposals' : `${proposalCount} Proposals`}
      </h2>

      {!hideFilters && <ProposalSortAndFilters className="mb-8" />}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ProposalCardSkeleton />
            <ProposalCardSkeleton />
            <ProposalCardSkeleton />
            <ProposalCardSkeleton />
            <ProposalCardSkeleton />
            <ProposalCardSkeleton />
          </>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <FundingProposalCard key={entry.id} entry={entry} showActions={false} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">No proposals found</p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Load more proposals
          </button>
        </div>
      )}
    </div>
  );
};
