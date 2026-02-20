'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import type {
  ProposalStatusFilter,
  ProposalSortOption,
} from '@/components/Funding/lib/proposalSortAndFilterConfig';

interface ProposalListContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  proposalCount: number;

  statusFilter: ProposalStatusFilter;
  setStatusFilter: (value: ProposalStatusFilter) => void;
  taxDeductible: boolean;
  setTaxDeductible: (value: boolean) => void;
  sortBy: ProposalSortOption;
  setSortBy: (value: ProposalSortOption) => void;
}

const ProposalListContext = createContext<ProposalListContextValue | null>(null);

interface ProposalListProviderProps {
  children: ReactNode;
  grantId?: number;
}

export function ProposalListProvider({ children, grantId }: ProposalListProviderProps) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('all');
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [sortBy, setSortBy] = useState<ProposalSortOption>('best');

  const feedParams = useMemo(() => {
    const isCompleted = statusFilter === 'completed';
    return {
      fundraiseStatus: isCompleted
        ? ('CLOSED' as const)
        : statusFilter === 'open'
          ? ('OPEN' as const)
          : undefined,
      ordering: isCompleted ? 'newest' : sortBy,
    };
  }, [statusFilter, sortBy]);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId,
        fundraiseStatus: feedParams.fundraiseStatus,
        ordering: feedParams.ordering,
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [grantId, feedParams]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    try {
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId,
        fundraiseStatus: feedParams.fundraiseStatus,
        ordering: feedParams.ordering,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more proposals:', error);
    }
  }, [isLoading, hasMore, page, grantId, feedParams]);

  const value = useMemo<ProposalListContextValue>(
    () => ({
      entries,
      isLoading,
      hasMore,
      loadMore,
      proposalCount: entries.length,
      statusFilter,
      setStatusFilter,
      taxDeductible,
      setTaxDeductible,
      sortBy,
      setSortBy,
    }),
    [entries, isLoading, hasMore, loadMore, statusFilter, taxDeductible, sortBy]
  );

  return <ProposalListContext.Provider value={value}>{children}</ProposalListContext.Provider>;
}

export function useProposalList() {
  const context = useContext(ProposalListContext);
  if (!context) {
    throw new Error('useProposalList must be used within a ProposalListProvider');
  }
  return context;
}
