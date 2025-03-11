import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';

export type FeedTab = 'following' | 'latest' | 'popular';

interface UseFeedOptions {
  hubSlug?: string;
}

export const useFeed = (activeTab: FeedTab, options: UseFeedOptions = {}) => {
  const { status } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    loadFeed();
  }, [activeTab, options.hubSlug, status]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView: activeTab,
        hubSlug: options.hubSlug,
      });
      setEntries(result.entries);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        feedView: activeTab,
        hubSlug: options.hubSlug,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more feed items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh: loadFeed,
  };
};
