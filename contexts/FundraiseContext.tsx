'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import type {
  ProposalStatusFilter,
  ProposalSortOption,
} from '@/components/Funding/lib/proposalSortAndFilterConfig';

interface FundraiseContextValue {
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

  sidebarFundraises: FeedEntry[];
  isSidebarLoading: boolean;
  fetchSidebarFundraises: () => Promise<void>;
}

const FundraiseContext = createContext<FundraiseContextValue | null>(null);

interface FundraiseProviderProps {
  children: ReactNode;
  grantId?: number;
}

export function FundraiseProvider({ children, grantId }: FundraiseProviderProps) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('all');
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [sortBy, setSortBy] = useState<ProposalSortOption>('best');

  // Sidebar lazy-loaded data (ref-guarded, fetched at most once)
  const [sidebarFundraises, setSidebarFundraises] = useState<FeedEntry[]>([]);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const hasSidebarDataRef = useRef(false);

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
      console.error('Error fetching fundraises:', error);
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
      console.error('Error loading more fundraises:', error);
    }
  }, [isLoading, hasMore, page, grantId, feedParams]);

  const fetchSidebarFundraises = useCallback(async () => {
    if (hasSidebarDataRef.current) return;
    hasSidebarDataRef.current = true;

    setIsSidebarLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 5,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        fundraiseStatus: 'OPEN',
        ordering: 'best',
      });
      setSidebarFundraises(result.entries);
    } catch (error) {
      console.error('Error fetching sidebar fundraises:', error);
    } finally {
      setIsSidebarLoading(false);
    }
  }, []);

  const value = useMemo<FundraiseContextValue>(
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
      sidebarFundraises,
      isSidebarLoading,
      fetchSidebarFundraises,
    }),
    [
      entries,
      isLoading,
      hasMore,
      loadMore,
      statusFilter,
      taxDeductible,
      sortBy,
      sidebarFundraises,
      isSidebarLoading,
      fetchSidebarFundraises,
    ]
  );

  return <FundraiseContext.Provider value={value}>{children}</FundraiseContext.Provider>;
}

export function useFundraises() {
  const context = useContext(FundraiseContext);
  if (!context) {
    throw new Error('useFundraises must be used within a FundraiseProvider');
  }
  return context;
}
