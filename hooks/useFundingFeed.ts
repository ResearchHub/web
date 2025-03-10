import { useState, useEffect, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { UnifiedDocumentService } from '@/services/unifiedDocument.service';

interface UseFundingFeedOptions {
  hubSlug?: string;
  ordering?: string;
  time?: string;
}

export const useFundingFeed = (options: UseFundingFeedOptions = {}) => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await UnifiedDocumentService.getPreregistrations({
        page: 1,
        pageSize: 20,
        ordering: options.ordering || 'hot',
        time: options.time || 'today',
        hubSlug: options.hubSlug,
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(1);
    } catch (error) {
      console.error('Error loading funding feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [options.hubSlug, options.ordering, options.time]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await UnifiedDocumentService.getPreregistrations({
        page: nextPage,
        pageSize: 20,
        ordering: options.ordering || 'hot',
        time: options.time || 'today',
        hubSlug: options.hubSlug,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more funding items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page, options.hubSlug, options.ordering, options.time]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh: loadFeed,
    total,
  };
};
