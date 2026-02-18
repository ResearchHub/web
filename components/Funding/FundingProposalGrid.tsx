'use client';

import { FC } from 'react';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { ProposalSortAndFilters } from './ProposalSortAndFilters';
import { useProposalList } from '@/contexts/ProposalListContext';
import { cn } from '@/utils/styles';

interface FundingProposalGridProps {
  className?: string;
}

export const FundingProposalGrid: FC<FundingProposalGridProps> = ({ className }) => {
  const { entries, isLoading, hasMore, loadMore, proposalCount } = useProposalList();

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
        {!isLoading && <span className="text-sm text-gray-500">({proposalCount})</span>}
      </div>

      <ProposalSortAndFilters className="mb-4" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          entries.map((entry) => <FundingProposalCard key={entry.id} entry={entry} />)
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
