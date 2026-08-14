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
import { ActivityService } from '@/services/activity.service';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

interface ActivityFeedContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  activate: () => void;
  restoredScrollPosition: number | null;
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

  const [activated, setActivated] = useState(hasRestoredEntries);
  const activate = useCallback(() => setActivated(true), []);
  const skipFetchAfterRestoreRef = useRef(hasRestoredEntries);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);

    try {
      const result = await ActivityService.getActivity({ page: 1 });
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const result = await ActivityService.getActivity({ page: nextPage });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more activity:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore]);

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
