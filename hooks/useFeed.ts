import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';

export type FeedTab = 'for-you' | 'following' | 'popular' | 'latest';

export const useFeed = (activeTab: FeedTab) => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadFeed = async () => {
      setIsLoading(true);
      try {
        const result = await FeedService.getFeed({
          page: 1,
          pageSize: 20,
          action: activeTab === 'following' ? 'follow' : undefined,
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

    loadFeed();
  }, [activeTab]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    try {
      const nextPage = page + 1;
      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        action: activeTab === 'following' ? 'follow' : undefined,
      });
      setEntries((prev) => [...prev, ...result.entries]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more feed items:', error);
    }
  };

  const sortEntries = (entries: FeedEntry[]) => {
    switch (activeTab) {
      case 'popular':
        return [...entries].sort((a, b) => {
          const getMetricScore = (entry: FeedEntry) => {
            const metrics = entry.metrics || { votes: 0, comments: 0 };
            return (metrics.votes || 0) + (metrics.comments || 0);
          };
          return getMetricScore(b) - getMetricScore(a);
        });
      case 'latest':
        return [...entries].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      default:
        return entries;
    }
  };

  return {
    entries: sortEntries(entries),
    isLoading,
    hasMore,
    loadMore,
  };
};
