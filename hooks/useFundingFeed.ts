import { useState, useEffect, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

interface UseFundingFeedResult {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setSortBy: (sort: string) => void;
  sortBy: string;
}

export const useFundingFeed = (pageSize: number = 20, grantId?: number): UseFundingFeedResult => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sortBy, setSortBy] = useState('personalized');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const getFeedParams = useCallback(
    (pageNum: number) => ({
      contentType: 'PREREGISTRATION',
      endpoint: 'funding_feed' as const,
      pageSize,
      page: pageNum,
      grantId,
      feedView: sortBy,
    }),
    [pageSize, grantId, sortBy]
  );

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPage(1);

    try {
      const result = await FeedService.getFeed(getFeedParams(1));
      setEntries(result.entries);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
      setEntries([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [getFeedParams]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);
    const nextPage = page + 1;

    try {
      const result = await FeedService.getFeed(getFeedParams(nextPage));
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more applications'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, getFeedParams]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return {
    entries,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh: fetchFeed,
    setSortBy,
    sortBy,
  };
};
