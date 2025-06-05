import { useState, useEffect, useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

interface UseFundingFeedResult {
  entries: FeedEntry[];
  isLoading: boolean;
  error: Error | null;
  fetchFundingFeed: () => Promise<void>;
  setSortBy: (sort: string) => void;
  sortBy: string;
}

export const useFundingFeed = (limit: number = 10, grantId?: number): UseFundingFeedResult => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sortBy, setSortBy] = useState<string>('personalized');

  const fetchFundingFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await FeedService.getFeed({
        contentType: 'PREREGISTRATION',
        endpoint: 'funding_feed',
        pageSize: limit,
        page: 1, // Fetch only the first page
        grantId, // Pass the grantId to filter results
        feedView: sortBy === 'personalized' ? 'personalized' : sortBy, // Map sort to feedView
      });
      setEntries(result.entries);
    } catch (err) {
      console.error('Error fetching funding feed:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch funding feed'));
      setEntries([]); // Clear entries on error
    } finally {
      setIsLoading(false);
    }
  }, [limit, grantId, sortBy]); // Add sortBy to dependencies

  useEffect(() => {
    fetchFundingFeed();
  }, [fetchFundingFeed]); // Re-fetch when dependencies change

  return {
    entries,
    isLoading,
    error,
    fetchFundingFeed,
    setSortBy,
    sortBy,
  };
};
