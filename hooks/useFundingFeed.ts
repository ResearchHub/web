import { useState, useEffect, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

interface UseFundingFeedResult {
  entries: FeedEntry[];
  isLoading: boolean;
  error: Error | null;
  fetchFundingFeed: () => Promise<void>;
}

export const useFundingFeed = (limit: number = 10): UseFundingFeedResult => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFundingFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await FeedService.getFeed({
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        pageSize: limit,
        page: 1, // Fetch only the first page
      });
      setEntries(result.entries);
    } catch (err) {
      console.error('Error fetching funding feed:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch funding feed'));
      setEntries([]); // Clear entries on error
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFundingFeed();
  }, [fetchFundingFeed]); // Re-fetch if the limit changes (though it's constant here)

  return {
    entries,
    isLoading,
    error,
    fetchFundingFeed,
  };
};
