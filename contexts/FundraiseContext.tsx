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
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

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

  /** Call once from the consuming component to trigger the initial fetch. */
  activate: () => void;

  restoredScrollPosition: number | null;
  lastClickedEntryId: string | null;
  restorationTab: string;

  sidebarFundraises: FeedEntry[];
  isSidebarLoading: boolean;
  fetchSidebarFundraises: () => Promise<void>;
}

const PAGE_SIZE = 20;
const FundraiseContext = createContext<FundraiseContextValue | null>(null);

let _sidebarFundraisesCache: FeedEntry[] = [];

interface FundraiseProviderProps {
  children: ReactNode;
  grantId?: number;
}

export function FundraiseProvider({ children, grantId }: FundraiseProviderProps) {
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

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [totalCount, setTotalCount] = useState(initialEntries.length);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);

  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('all');
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [sortBy, setSortBy] = useState<ProposalSortOption>('best');

  // Sidebar lazy-loaded data (ref-guarded, fetched at most once)
  const [sidebarFundraises, setSidebarFundraisesRaw] =
    useState<FeedEntry[]>(_sidebarFundraisesCache);
  const [isSidebarLoading, setIsSidebarLoading] = useState(_sidebarFundraisesCache.length === 0);
  const hasSidebarDataRef = useRef(_sidebarFundraisesCache.length > 0);
  const setSidebarFundraises = useCallback((entries: FeedEntry[]) => {
    _sidebarFundraisesCache = entries;
    setSidebarFundraisesRaw(entries);
  }, []);

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
      });
      setEntries(result.entries);
      setTotalCount(result.count);
      setHasMore(result.hasMore && result.entries.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching fundraises:', error);
    } finally {
      setIsLoading(false);
    }
  }, [grantId, feedParams]);

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
  }, [isLoading, isLoadingMore, hasMore, grantId, feedParams]);

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
  }, [setSidebarFundraises]);

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
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
      restorationTab,
      sidebarFundraises,
      isSidebarLoading,
      fetchSidebarFundraises,
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
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
      restorationTab,
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
