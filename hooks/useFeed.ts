import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

export type FeedTab = 'following' | 'latest';

export const useFeed = (activeTab: FeedTab) => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, [activeTab]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feed_view:
          activeTab === 'following' ? 'following' : activeTab === 'latest' ? 'latest' : undefined,
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

    try {
      const nextPage = page + 1;
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        feed_view:
          activeTab === 'following' ? 'following' : activeTab === 'latest' ? 'latest' : undefined,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more feed items:', error);
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
