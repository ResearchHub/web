import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';

export type FeedTab = 'following' | 'latest' | 'popular';
export type FundingTab = 'all' | 'open' | 'closed';
export type FeedSource = 'all' | 'researchhub';

interface UseFeedOptions {
  hubSlug?: string;
  contentType?: string;
  source?: FeedSource;
  endpoint?: 'feed' | 'funding_feed' | 'grant_feed';
  fundraiseStatus?: 'OPEN' | 'CLOSED';
  createdBy?: number;
  ordering?: string;
  hotScoreVersion?: 'v1' | 'v2';
  includeHotScoreBreakdown?: boolean;
  includeEnded?: boolean;
  initialData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
}

export const useFeed = (activeTab: FeedTab | FundingTab, options: UseFeedOptions = {}) => {
  const { status } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>(options.initialData?.entries || []);
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [hasMore, setHasMore] = useState(options.initialData?.hasMore || false);
  const [page, setPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<FeedTab | FundingTab>(activeTab);
  const [currentOptions, setCurrentOptions] = useState<UseFeedOptions>(options);

  // Only load the feed when the component mounts or when the session status changes
  // We no longer reload when activeTab changes, as that will be handled by page navigation
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // If we have initial data and it's the first load, don't fetch again
    if (
      options.initialData &&
      entries.length === options.initialData.entries.length &&
      page === 1
    ) {
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

  // Check if options have changed
  useEffect(() => {
    // Compare relevant options (excluding initialData which shouldn't trigger a reload)
    const relevantOptionsChanged =
      options.hubSlug !== currentOptions.hubSlug ||
      options.contentType !== currentOptions.contentType ||
      options.source !== currentOptions.source ||
      options.endpoint !== currentOptions.endpoint ||
      options.fundraiseStatus !== currentOptions.fundraiseStatus ||
      options.createdBy !== currentOptions.createdBy ||
      options.ordering !== currentOptions.ordering ||
      options.hotScoreVersion !== currentOptions.hotScoreVersion ||
      options.includeHotScoreBreakdown !== currentOptions.includeHotScoreBreakdown ||
      options.includeEnded !== currentOptions.includeEnded;

    if (relevantOptionsChanged) {
      setCurrentOptions(options);
      loadFeed();
    }
  }, [options]);

  const loadFeed = async () => {
    setIsLoading(true);
    setEntries([]); // Clear entries to show skeleton
    try {
      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView: activeTab as FeedTab, // Only pass feedView if it's a FeedTab
        hubSlug: options.hubSlug,
        contentType: options.contentType,
        source: options.source,
        endpoint: options.endpoint,
        fundraiseStatus: options.fundraiseStatus,
        createdBy: options.createdBy,
        ordering: options.ordering,
        hotScoreVersion: options.hotScoreVersion,
        includeHotScoreBreakdown: options.includeHotScoreBreakdown,
        includeEnded: options.includeEnded,
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
        feedView: activeTab as FeedTab, // Only pass feedView if it's a FeedTab
        hubSlug: options.hubSlug,
        contentType: options.contentType,
        source: options.source,
        endpoint: options.endpoint,
        fundraiseStatus: options.fundraiseStatus,
        createdBy: options.createdBy,
        ordering: options.ordering,
        hotScoreVersion: options.hotScoreVersion,
        includeHotScoreBreakdown: options.includeHotScoreBreakdown,
        includeEnded: options.includeEnded,
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
