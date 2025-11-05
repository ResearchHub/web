import { useState, useEffect, useMemo } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const restoredState = useMemo(() => {
    if (!isBackNavigation) {
      return null;
    }

    const feedKey = getFeedKey({
      pathname,
      tab: activeTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      clearFeedState(feedKey);
      return savedState;
    }

    return null;
  }, [isBackNavigation, pathname, activeTab, queryParams, getFeedState, clearFeedState]);

  const initialEntries = restoredState?.entries || options.initialData?.entries || [];
  const initialHasMore = restoredState?.hasMore ?? options.initialData?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries && !options.initialData);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [currentTab, setCurrentTab] = useState<FeedTab | FundingTab>(activeTab);
  const [currentOptions, setCurrentOptions] = useState<UseFeedOptions>(options);

  const [restoredScrollPosition, setRestoredScrollPosition] = useState<number | null>(
    restoredState?.scrollPosition ?? null
  );

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (hasRestoredEntries && entries.length > 0) {
      return;
    }

    if (
      options.initialData &&
      entries.length === options.initialData.entries.length &&
      page === 1
    ) {
      return;
    }

    if (currentTab !== activeTab) {
      setCurrentTab(activeTab);
      loadFeed();
    } else if (entries.length === 0) {
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

  useEffect(() => {
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
    setEntries([]);
    try {
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
    restoredScrollPosition,
    page,
  };
};
