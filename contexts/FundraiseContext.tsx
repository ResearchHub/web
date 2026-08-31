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
import { useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import {
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type ProposalStatusFilter,
  type ProposalSortOption,
} from '@/components/Funding/lib/proposalSortAndFilterConfig';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

function isTruthyQueryParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

interface FundraiseContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  proposalCount: number;

  statusFilter: ProposalStatusFilter;
  setStatusFilter: (value: ProposalStatusFilter) => void;
  taxDeductible: boolean;
  setTaxDeductible: (value: boolean) => void;
  sortBy: ProposalSortOption;
  setSortBy: (value: ProposalSortOption) => void;
  isGrantScoped: boolean;

  /** Call once from the consuming component to trigger the initial fetch. */
  activate: () => void;

  restoredScrollPosition: number | null;
  lastClickedEntryId: string | null;
  restorationTab: string;
}

const PAGE_SIZE = 20;
const DEFAULT_STATUS: ProposalStatusFilter = 'all';
const DEFAULT_SORT: ProposalSortOption = 'best';
const FundraiseContext = createContext<FundraiseContextValue | null>(null);

function resolveRestoredStatus(value: string | undefined): ProposalStatusFilter {
  if (STATUS_OPTIONS.some((option) => option.value === value)) {
    return value as ProposalStatusFilter;
  }
  return DEFAULT_STATUS;
}

function resolveRestoredSort(value: string | undefined): ProposalSortOption {
  if (SORT_OPTIONS.some((option) => option.value === value)) {
    return value as ProposalSortOption;
  }
  return DEFAULT_SORT;
}

interface FundraiseProviderProps {
  children: ReactNode;
  grantId?: number;
}

export function FundraiseProvider({ children, grantId }: FundraiseProviderProps) {
  const searchParams = useSearchParams();
  const isGrantScoped = grantId != null;
  const includePrivate = isGrantScoped || isTruthyQueryParam(searchParams.get('include_private'));

  const restorationTab = useMemo(() => {
    const parts = ['proposals'];
    if (grantId != null) parts.push(`grant-${grantId}`);
    return parts.join('-');
  }, [grantId]);

  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab: restorationTab,
  });

  const hasRestoredEntries = restoredState !== null && (restoredState.entries?.length ?? 0) > 0;
  const initialEntries = restoredState?.entries ?? [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const initialStatusFilter = resolveRestoredStatus(restoredState?.filters?.statusFilter);
  const initialSortBy = resolveRestoredSort(restoredState?.filters?.sortBy);

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [totalCount, setTotalCount] = useState(initialEntries.length);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);

  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>(initialStatusFilter);
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [sortBy, setSortBy] = useState<ProposalSortOption>(initialSortBy);

  const feedParams = useMemo(() => {
    const isStatusCompleted = statusFilter === 'completed';
    const isSortCompleted = sortBy === 'completed';
    const isCompleted = isStatusCompleted || isSortCompleted;
    return {
      fundraiseStatus: isCompleted
        ? ('CLOSED' as const)
        : statusFilter === 'open'
          ? ('OPEN' as const)
          : undefined,
      ordering: isCompleted ? 'newest' : sortBy,
    };
  }, [statusFilter, sortBy]);

  const [activated, setActivated] = useState(hasRestoredEntries);
  const activate = useCallback(() => setActivated(true), []);
  const skipFetchAfterRestoreRef = useRef(hasRestoredEntries);

  useEffect(() => {
    if (grantId != null) {
      setActivated(true);
    }
  }, [grantId]);

  const fetchProposals = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: PAGE_SIZE,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId,
        fundraiseStatus: feedParams.fundraiseStatus,
        ordering: feedParams.ordering,
        includePrivate,
      });
      setEntries(result.entries);
      setTotalCount(result.count);
      setHasMore(result.hasMore && result.entries.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching fundraises:', error);
    } finally {
      setIsLoading(false);
    }
  }, [grantId, feedParams, includePrivate]);

  useEffect(() => {
    if (!activated) return;
    if (skipFetchAfterRestoreRef.current) {
      skipFetchAfterRestoreRef.current = false;
      return;
    }
    fetchProposals();
  }, [activated, fetchProposals]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: PAGE_SIZE,
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        grantId,
        fundraiseStatus: feedParams.fundraiseStatus,
        ordering: feedParams.ordering,
        includePrivate,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setTotalCount(result.count);
      setHasMore(result.hasMore && result.entries.length >= PAGE_SIZE);
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more fundraises:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, grantId, feedParams, includePrivate]);

  const value = useMemo<FundraiseContextValue>(
    () => ({
      entries,
      isLoading: !activated || isLoading,
      isLoadingMore,
      hasMore,
      page,
      loadMore,
      proposalCount: totalCount,
      statusFilter,
      setStatusFilter,
      taxDeductible,
      setTaxDeductible,
      sortBy,
      setSortBy,
      isGrantScoped,
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
      restorationTab,
    }),
    [
      entries,
      totalCount,
      activated,
      isLoading,
      isLoadingMore,
      hasMore,
      page,
      loadMore,
      statusFilter,
      taxDeductible,
      sortBy,
      isGrantScoped,
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
      restorationTab,
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
