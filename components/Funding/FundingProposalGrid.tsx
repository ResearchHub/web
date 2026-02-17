'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { FundingProposalCard } from './FundingProposalCard';
import { ProposalCardSkeleton } from '@/components/skeletons/ProposalCardSkeleton';
import { cn } from '@/utils/styles';

interface FundingProposalGridProps {
  /** Grant ID to filter proposals by, or null for all proposals */
  grantId?: number | null;
  /** Initial entries to display (for SSR) */
  initialEntries?: FeedEntry[];
  /** Optional class name */
  className?: string;
}

export const FundingProposalGrid: FC<FundingProposalGridProps> = ({
  grantId,
  initialEntries,
  className,
}) => {
  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries || []);
  const [isLoading, setIsLoading] = useState(!initialEntries);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId: grantId || undefined,
        ordering: 'best',
      });

      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [grantId]);

  // Fetch proposals when grantId changes or on initial mount
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;

    try {
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId: grantId || undefined,
        ordering: 'best',
      });

      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more proposals:', error);
    }
  };

  const proposalCount = entries.length;

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
        {!isLoading && <span className="text-sm text-gray-500">({proposalCount})</span>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Skeleton loading
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
