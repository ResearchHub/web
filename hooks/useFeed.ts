import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';
import { isEqual, omit } from 'lodash';

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
  initialData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
  hubIds?: (string | number)[]; // Hub id's to filter by
}

export const useFeed = (activeTab: FeedTab | FundingTab, options: UseFeedOptions = {}) => {
  const { status } = useSession();
  const [entries, setEntries] = useState<FeedEntry[]>(options.initialData?.entries || []);
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [hasMore, setHasMore] = useState(options.initialData?.hasMore || false);
  const [page, setPage] = useState(1);
  const [currentTab, setCurrentTab] = useState<FeedTab | FundingTab>(activeTab);
  const [currentOptions, setCurrentOptions] = useState<UseFeedOptions>(options);

  // Re-load the feed if any of the relevant options change
  const omitCheckKeys = ['initialData']; // Keys to ignore when comparing options
  useEffect(() => {
    const filteredOptions = omit(options, omitCheckKeys);
    const filteredCurrentOptions = omit(currentOptions, omitCheckKeys);

    if (!isEqual(filteredOptions, filteredCurrentOptions)) {
      setCurrentOptions(options);
      loadFeed();
    }
  }, [options]);

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

  // Load feed items for first or subsequent pages.
  const loadFeed = async (pageNumber: number = 1) => {
    if (pageNumber > 1 && (!hasMore || isLoading)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await FeedService.getFeed({
        page: pageNumber,
        pageSize: 20,
        feedView: activeTab as FeedTab, // Only pass feedView if it's a FeedTab
        hubSlug: options.hubSlug,
        contentType: options.contentType,
        source: options.source,
        endpoint: options.endpoint,
        fundraiseStatus: options.fundraiseStatus,
        createdBy: options.createdBy,
        ordering: options.ordering,
        hubIds: options.hubIds,
      });
      if (pageNumber === 1) {
        setEntries(result.entries);
      } else {
        setEntries((prev) => [...prev, ...result.entries]);
      }
      setHasMore(result.hasMore);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error loading feed for page:', pageNumber, error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    hasMore,
    loadMore: () => loadFeed(page + 1),
    refresh: loadFeed,
  };
};
