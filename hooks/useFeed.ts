import { useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedService } from '@/services/feed.service';
import { useSession } from 'next-auth/react';
import { useFeedStateRestoration } from './useFeedStateRestoration';

export type FeedTab = 'following' | 'latest' | 'popular' | 'for-you';
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
  filter?: string;
  userId?: string;
  isDebugMode?: boolean;
  initialData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
}

export const useFeed = (activeTab: FeedTab | FundingTab, options: UseFeedOptions = {}) => {
  const { status } = useSession();
  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab,
  });

  const initialEntries = restoredState?.entries || options.initialData?.entries || [];
  const initialHasMore = restoredState?.hasMore ?? options.initialData?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [currentTab, setCurrentTab] = useState<FeedTab | FundingTab>(activeTab);
  const [currentOptions, setCurrentOptions] = useState<UseFeedOptions>(options);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(
    initialEntries.length > 0 || initialHasMore
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
      setHasAttemptedLoad(false);
      setPage(1);
      loadFeed();
    } else if (!isLoading && !hasAttemptedLoad && page === 1) {
      loadFeed();
    }
  }, [
    status,
    activeTab,
    hasRestoredEntries,
    page,
    currentTab,
    options.initialData,
    isLoading,
    hasAttemptedLoad,
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
      options.isDebugMode !== currentOptions.isDebugMode ||
      options.filter !== currentOptions.filter ||
      options.userId !== currentOptions.userId;

    const tabIsChanging = currentTab !== activeTab;

    if (relevantOptionsChanged && !tabIsChanging) {
      setCurrentOptions(options);
      setHasAttemptedLoad(false);
      loadFeed();
    } else if (relevantOptionsChanged && tabIsChanging) {
      setCurrentOptions(options);
    }
  }, [options, currentTab, activeTab]);

  const loadFeed = async () => {
    setIsLoading(true);
    setEntries([]);

    try {
      const isHomeFeedTab =
        activeTab === 'popular' ||
        activeTab === 'following' ||
        activeTab === 'latest' ||
        activeTab === 'for-you';

      const feedView = isHomeFeedTab
        ? activeTab === 'for-you'
          ? 'personalized'
          : activeTab
        : undefined;

      const result = await FeedService.getFeed({
        page: 1,
        pageSize: 20,
        feedView,
        hubSlug: options.hubSlug,
        contentType: options.contentType,
        source: options.source,
        endpoint: options.endpoint,
        fundraiseStatus: options.fundraiseStatus,
        createdBy: options.createdBy,
        ordering: options.ordering,
        includeHotScoreBreakdown: options.isDebugMode,
        filter: options.filter,
        userId: options.userId,
      });

      setEntries(result.entries);
      setHasMore(result.hasMore);
      setPage(1);
      setHasAttemptedLoad(true);
    } catch (error) {
      console.error('Error loading feed:', error);
      setPage(1);
      setHasAttemptedLoad(true);
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
        activeTab === 'popular' ||
        activeTab === 'following' ||
        activeTab === 'latest' ||
        activeTab === 'for-you';

      const feedView = isHomeFeedTab
        ? activeTab === 'for-you'
          ? 'personalized'
          : activeTab
        : undefined;

      const result = await FeedService.getFeed({
        page: nextPage,
        pageSize: 20,
        feedView,
        hubSlug: options.hubSlug,
        contentType: options.contentType,
        source: options.source,
        endpoint: options.endpoint,
        fundraiseStatus: options.fundraiseStatus,
        createdBy: options.createdBy,
        ordering: options.ordering,
        includeHotScoreBreakdown: options.isDebugMode,
        filter: options.filter,
        userId: options.userId,
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
    lastClickedEntryId,
  };
};
