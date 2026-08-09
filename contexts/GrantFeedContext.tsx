'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import type { GrantSortOption } from '@/components/Funding/lib/grantSortConfig';

interface GrantFeedContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sortBy: GrantSortOption;
  setSortBy: (value: GrantSortOption) => void;
  activate: () => void;
}

const GrantFeedContext = createContext<GrantFeedContextValue | null>(null);

const PAGE_SIZE = 20;

/**
 * Homepage grant (RFP) feed. Stays mounted across home tab switches so we only
 * refetch when sort changes or the provider remounts.
 */
export function GrantFeedProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<GrantSortOption>('newest');
  const [activated, setActivated] = useState(false);

  const activate = useCallback(() => setActivated(true), []);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
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
      setPage(1);
    } catch (error) {
      console.error('Error fetching grant feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (activated) {
      fetchInitial();
    }
  }, [activated, fetchInitial]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
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
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more grants:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, page, sortBy]);

  const value = useMemo<GrantFeedContextValue>(
    () => ({
      entries,
      isLoading: !activated || isLoading,
      hasMore,
      loadMore,
      sortBy,
      setSortBy,
      activate,
    }),
    [entries, activated, isLoading, hasMore, loadMore, sortBy, activate]
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
