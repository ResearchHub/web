'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FeedEntry } from '@/types/feed';
import { ActivityService, ActivityScope } from '@/services/activity.service';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

export type ActivityTab = 'all' | 'peer_reviews' | 'financial';

interface UseActivityFeedOptions {
  scope?: ActivityScope;
  grantId?: number | string;
  enabled?: boolean;
}

export function useActivityFeed({ scope, grantId, enabled = true }: UseActivityFeedOptions = {}) {
  const restorationTab = useMemo(() => {
    const parts = ['activity'];
    if (grantId != null) parts.push(`grant-${grantId}`);
    if (scope) parts.push(scope);
    return parts.join('-');
  }, [grantId, scope]);

  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab: restorationTab,
  });

  const hasRestoredEntries = restoredState !== null;
  const initialEntries = restoredState?.entries ?? [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [count, setCount] = useState(initialEntries.length);
  const [page, setPage] = useState(initialPage);
  const pageRef = useRef(initialPage);
  // Skip the first fetch when we restored entries; subsequent fetchInitial
  // identity changes (scope / grantId) still refetch.
  const skipNextFetchRef = useRef(hasRestoredEntries && initialEntries.length > 0);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);

    try {
      const result = await ActivityService.getActivity({
        page: 1,
        scope,
        grantId,
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setCount(result.count);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [scope, grantId]);

  useEffect(() => {
    if (enabled === false) {
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchInitial();
  }, [enabled, fetchInitial]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const result = await ActivityService.getActivity({
        page: nextPage,
        scope,
        grantId,
      });
      setEntries((prev) => {
        const next = [...prev, ...result.entries];
        setCount(next.length);
        return next;
      });
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more activity:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, scope, grantId]);

  return {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    count,
    page,
    loadMore,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  };
}
