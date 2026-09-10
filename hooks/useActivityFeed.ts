'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FeedEntry } from '@/types/feed';
import { ActivityService, ActivityCommentType, ActivityScope } from '@/services/activity.service';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

export type ActivityTab = 'all' | 'peer_reviews' | 'financial';

interface UseActivityFeedOptions {
  /** Author profile id, to read one author's activity instead of the site-wide feed. */
  authorId?: number;
  contentType?: string;
  /** Pass a stable reference: a new array on every render restarts the feed. */
  commentTypes?: readonly ActivityCommentType[];
  scope?: ActivityScope;
  grantId?: number | string;
  disableCache?: boolean;
  enabled?: boolean;
}

export function useActivityFeed({
  authorId,
  contentType,
  commentTypes,
  scope,
  grantId,
  disableCache = false,
  enabled = true,
}: UseActivityFeedOptions = {}) {
  const restorationTab = useMemo(() => {
    const parts = ['activity'];
    if (grantId != null) parts.push(`grant-${grantId}`);
    if (scope) parts.push(scope);
    return parts.join('-');
  }, [grantId, scope]);

  const { feedKey, restoredState, restoredScrollPosition, lastClickedEntryId } =
    useFeedStateRestoration({
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
  // Skip the first fetch when we restored; subsequent fetchInitial identity
  // changes (scope / grantId) still refetch.
  const skipNextFetchRef = useRef(hasRestoredEntries);

  const fetchPage = useCallback(
    (pageNumber: number) =>
      authorId
        ? ActivityService.getAuthorActivity(authorId, {
            page: pageNumber,
            contentType,
            commentTypes,
            scope,
          })
        : ActivityService.getActivity({ page: pageNumber, scope, grantId, disableCache }),
    [authorId, contentType, commentTypes, scope, grantId, disableCache]
  );

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;
    setPage(1);

    try {
      const result = await fetchPage(1);
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setCount(result.count);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    if (enabled === false) return;
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
      const result = await fetchPage(nextPage);
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
  }, [isLoading, isLoadingMore, hasMore, fetchPage]);

  return {
    entries,
    // While deferred, keep the loading UI unless we already restored entries.
    isLoading: enabled === false ? !hasRestoredEntries : isLoading,
    isLoadingMore,
    hasMore,
    count,
    page,
    loadMore,
    feedKey,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  };
}
