'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { GRANT_SORT_OPTIONS, type GrantSortOption } from '@/components/Funding/lib/grantSortConfig';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

interface GrantFeedContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  sortBy: GrantSortOption;
  setSortBy: (value: GrantSortOption) => void;
  activate: () => void;
  restoredScrollPosition: number | null;
  lastClickedEntryId: string | null;
  restorationTab: string;
}

const GrantFeedContext = createContext<GrantFeedContextValue | null>(null);

const PAGE_SIZE = 20;
const RESTORATION_TAB = 'grants';
const DEFAULT_SORT: GrantSortOption = 'newest';

function resolveRestoredSort(value: string | undefined): GrantSortOption {
  if (GRANT_SORT_OPTIONS.some((option) => option.value === value)) {
    return value as GrantSortOption;
  }
  return DEFAULT_SORT;
}

/**
 * Homepage grant (RFP) feed. Stays mounted across home tab switches so we only
 * refetch when sort changes or the provider remounts (leave home) or after
 * back-nav restore.
 */
export function GrantFeedProvider({ children }: { children: ReactNode }) {
  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab: RESTORATION_TAB,
  });

  const hasRestoredEntries = restoredState !== null && (restoredState.entries?.length ?? 0) > 0;
  const initialEntries = restoredState?.entries ?? [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const initialSortBy = resolveRestoredSort(restoredState?.filters?.sortBy);

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);
  const [sortBy, setSortBy] = useState<GrantSortOption>(initialSortBy);

  const [activated, setActivated] = useState(hasRestoredEntries);
  const activate = useCallback(() => setActivated(true), []);
  const skipFetchAfterRestoreRef = useRef(hasRestoredEntries);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: PAGE_SIZE,
        endpoint: 'grant_feed',
        contentType: 'GRANT',
        ordering: sortBy,
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching grant feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (!activated) return;
    if (skipFetchAfterRestoreRef.current) {
      skipFetchAfterRestoreRef.current = false;
      return;
    }
    fetchInitial();
  }, [activated, fetchInitial]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: PAGE_SIZE,
        endpoint: 'grant_feed',
        contentType: 'GRANT',
        ordering: sortBy,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more grants:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, sortBy]);

  const value = useMemo<GrantFeedContextValue>(
    () => ({
      entries,
      isLoading: !activated || isLoading,
      isLoadingMore,
      hasMore,
      page,
      loadMore,
      sortBy,
      setSortBy,
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
      restorationTab: RESTORATION_TAB,
    }),
    [
      entries,
      activated,
      isLoading,
      isLoadingMore,
      hasMore,
      page,
      loadMore,
      sortBy,
      activate,
      restoredScrollPosition,
      lastClickedEntryId,
    ]
  );

  return <GrantFeedContext.Provider value={value}>{children}</GrantFeedContext.Provider>;
}

export function useGrantFeed() {
  const context = useContext(GrantFeedContext);
  if (!context) {
    throw new Error('useGrantFeed must be used within a GrantFeedProvider');
  }
  return context;
}
