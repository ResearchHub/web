import { useState, useEffect, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

interface UseFundingFeedOptions {
  hubSlug?: string;
}

export const useFundingFeed = (options: UseFundingFeedOptions = {}) => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView: 'latest',
        hubSlug: options.hubSlug,
        contentType: 'preregistration', // Filter for preregistrations only
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error loading funding feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [options.hubSlug]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        feedView: 'latest',
        hubSlug: options.hubSlug,
        contentType: 'preregistration', // Filter for preregistrations only
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more funding items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page, options.hubSlug]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh: loadFeed,
  };
};
