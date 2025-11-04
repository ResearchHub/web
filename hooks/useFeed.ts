import { useState, useEffect, useMemo } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { getFeedKey } from '@/contexts/NavigationContext';

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
  const pathname = usePathname();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();

  // Check for restored state synchronously before initializing state
  const restoredState = useMemo(() => {
    if (!isBackNavigation) return null;

    const feedKey = getFeedKey({
      pathname,
      tab: activeTab,
    });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      // Clear the state after using it
      clearFeedState(feedKey);
      return savedState;
    }
    return null;
  }, [isBackNavigation, pathname, activeTab, getFeedState, clearFeedState]);

  // Use restored entries if available, otherwise use initialData
  const initialEntries = restoredState?.entries || options.initialData?.entries || [];
  // Restore hasMore and page from stored state if available
  const initialHasMore = restoredState?.hasMore ?? options.initialData?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries && !options.initialData);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [currentTab, setCurrentTab] = useState<FeedTab | FundingTab>(activeTab);
  const [currentOptions, setCurrentOptions] = useState<UseFeedOptions>(options);

  // Store scroll position for FeedContent to use
  const [restoredScrollPosition, setRestoredScrollPosition] = useState<number | null>(
    restoredState?.scrollPosition ?? null
  );

  // Only load the feed when the component mounts or when the session status changes
  // We no longer reload when activeTab changes, as that will be handled by page navigation
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // If we restored entries from sessionStorage, don't fetch
    if (hasRestoredEntries && entries.length > 0) {
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
  }, [
    status,
    activeTab,
    hasRestoredEntries,
    entries.length,
    page,
    currentTab,
    options.initialData,
  ]);

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
      // Only pass feedView for actual feed tabs (popular, following, latest)
      const isHomeFeedTab =
        activeTab === 'popular' || activeTab === 'following' || activeTab === 'latest';

      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView: isHomeFeedTab ? (activeTab as FeedTab) : undefined,
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
      // Error handling is done at component level
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      // Only pass feedView for actual feed tabs (popular, following, latest)
      const isHomeFeedTab =
        activeTab === 'popular' || activeTab === 'following' || activeTab === 'latest';

      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        feedView: isHomeFeedTab ? (activeTab as FeedTab) : undefined,
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
    restoredScrollPosition, // Return scroll position for FeedContent to restore
    page, // Return current page for FeedContent to save
  };
};
