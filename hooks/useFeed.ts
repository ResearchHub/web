import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';

export type FeedTab = 'following' | 'latest' | 'popular';

interface UseFeedOptions {
  hubSlug?: string;
  contentType?: string;
}

export const useFeed = (activeTab: FeedTab, options: UseFeedOptions = {}) => {
  const { status } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<FeedTab>(activeTab);

  // Only load the feed when the component mounts or when the session status changes
  // We no longer reload when activeTab changes, as that will be handled by page navigation
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // Only load the feed if the tab has changed
    if (currentTab !== activeTab) {
      setCurrentTab(activeTab);
      loadFeed();
    } else if (entries.length === 0) {
      // Initial load
      loadFeed();
    }
  }, [status, activeTab]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView: activeTab,
        hubSlug: options.hubSlug,
        contentType: options.contentType,
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
        contentType: options.contentType,
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
