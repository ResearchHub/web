'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedEntry } from '@/types/feed';
import { ActivityService, ActivityScope } from '@/services/activity.service';

export type ActivityTab = 'all' | 'peer_reviews' | 'financial';

interface UseActivityFeedOptions {
  scope?: ActivityScope;
  grantId?: number | string;
}

export function useActivityFeed({ scope, grantId }: UseActivityFeedOptions = {}) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const pageRef = useRef(1);

  const fetchInitial = useCallback(async () => {
    setEntries([]);
    setIsLoading(true);
    pageRef.current = 1;

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
    fetchInitial();
  }, [fetchInitial]);

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
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setCount(result.count);
      pageRef.current = nextPage;
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
    loadMore,
  };
}
