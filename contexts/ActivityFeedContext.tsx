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
import { useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { ActivityService } from '@/services/activity.service';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

function isDisableCacheParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

interface ActivityFeedContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  activate: () => void;
  restoredScrollPosition: number | null;
  /**
   * Whether this feed ever had a saved scroll position to return to. Unlike
   * `restoredScrollPosition`, which is consumed and reverts to null, this stays
   * true, so callers can tell a restored feed apart from a fresh visit at any
   * point in the provider's life.
   */
  hasSavedScrollPosition: boolean;
  lastClickedEntryId: string | null;
  restorationTab: string;
}

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null);

const RESTORATION_TAB = 'activity';

/**
 * Homepage Activity feed. Stays mounted across home tab switches so we only
 * refetch when the provider remounts (leave home) or after back-nav restore.
 */
export function ActivityFeedProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const disableCache = isDisableCacheParam(searchParams.get('disable_cache'));

  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab: RESTORATION_TAB,
  });

  const hasRestoredEntries = restoredState !== null && (restoredState.entries?.length ?? 0) > 0;
  const initialEntries = restoredState?.entries ?? [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);

  // `restoredScrollPosition` only survives until useFeedScrollTracking consumes
  // it and clears the back-navigation flag, after which a restored feed is
  // indistinguishable from a fresh one. Latch it instead of re-reading it.
  const [hasSavedScrollPosition, setHasSavedScrollPosition] = useState(
    restoredScrollPosition !== null
  );

  useEffect(() => {
    if (restoredScrollPosition !== null) {
      setHasSavedScrollPosition(true);
    }
  }, [restoredScrollPosition]);

  const [activated, setActivated] = useState(hasRestoredEntries);
  const activate = useCallback(() => setActivated(true), []);
  const skipFetchAfterRestoreRef = useRef(hasRestoredEntries);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);

    try {
      const result = await ActivityService.getActivity({ page: 1, disableCache });
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [disableCache]);

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
      const result = await ActivityService.getActivity({ page: nextPage, disableCache });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more activity:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, disableCache]);

  const value = useMemo<ActivityFeedContextValue>(
    () => ({
      entries,
      isLoading: !activated || isLoading,
      isLoadingMore,
      hasMore,
      page,
      loadMore,
      activate,
      restoredScrollPosition,
      hasSavedScrollPosition,
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
      activate,
      restoredScrollPosition,
      hasSavedScrollPosition,
      lastClickedEntryId,
    ]
  );

  return <ActivityFeedContext.Provider value={value}>{children}</ActivityFeedContext.Provider>;
}

/** Shared homepage activity feed (distinct from the parameterized `useActivityFeed` hook). */
export function useActivityFeeds() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeeds must be used within an ActivityFeedProvider');
  }
  return context;
}
