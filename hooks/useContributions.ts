import { useState, useEffect, useMemo } from 'react';
import { ContributionService, ContributionType } from '@/services/contribution.service';
import type { Contribution, ContributionListResponse } from '@/types/contribution';
import { ID } from '@/types/root';
import { getContributionUrl, parseContribution } from '@/types/contributionTransformer';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigation, getFeedKey } from '@/contexts/NavigationContext';
import { FeedEntry } from '@/types/feed';

interface UseContributionsOptions {
  contribution_type?: ContributionType;
  author_id?: ID;
  initialData?: ContributionListResponse;
  activeTab?: string;
}

export const useContributions = (options: UseContributionsOptions = {}) => {
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

  // Check for restored state
  const restoredState = useMemo(() => {
    if (options.contribution_type === 'ARTICLE') {
      return null;
    }

    if (!isBackNavigation || !options.author_id) {
      return null;
    }

    const feedKey = getFeedKey({
      pathname,
      tab: options.activeTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      clearFeedState(feedKey);
      return savedState;
    }

    return null;
  }, [
    isBackNavigation,
    pathname,
    options.activeTab,
    queryParams,
    options.author_id,
    getFeedState,
    clearFeedState,
  ]);

  const initialEntries = restoredState?.entries || [];
  const initialHasRestoredEntries = restoredState !== null;
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId;

  const [contributions, setContributions] = useState<Contribution[]>(
    options.initialData?.results || []
  );
  const [isLoading, setIsLoading] = useState(!initialHasRestoredEntries && !options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ContributionListResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);

  // Store restored entries separately for FeedContent to use
  // Preserve hasRestoredEntries in state so it doesn't change when isBackNavigation changes
  const [restoredFeedEntries, setRestoredFeedEntries] = useState<FeedEntry[]>(initialEntries);
  const [hasRestoredEntries, setHasRestoredEntries] = useState<boolean>(initialHasRestoredEntries);

  const loadContributions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ContributionService.getContributions({
        contribution_type: options.contribution_type,
        author_id: options.author_id,
      });

      const filteredResults = response.results.filter((result) => {
        try {
          const parsed = parseContribution(result);
          if (!parsed) return false;
          getContributionUrl(parsed);
          return true;
        } catch (error) {
          console.error('[Contribution] Could not parse contribution', error);
          return false;
        }
      });

      setContributions(filteredResults);
      setCurrentResponse({ ...response, results: filteredResults });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load contributions'));
      console.error('Error loading contributions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialHasRestoredEntries && initialEntries.length > 0 && !hasRestoredEntries) {
      setHasRestoredEntries(true);
      setRestoredFeedEntries(initialEntries);
    }
  }, [initialHasRestoredEntries, initialEntries.length, hasRestoredEntries]);

  useEffect(() => {
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      return;
    }

    if (options.initialData) {
      return;
    }

    loadContributions();
  }, [options.contribution_type, options.author_id, options.initialData]);

  const loadMore = async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await ContributionService.loadMore(currentResponse);

      setContributions((prev) => [...prev, ...nextPage.results]);
      setCurrentResponse(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more contributions'));
      console.error('Error loading more contributions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      return;
    }

    setContributions([]);
    setCurrentResponse(null);
    setRestoredFeedEntries([]);
    setHasRestoredEntries(false);
  }, [options.contribution_type, hasRestoredEntries, restoredFeedEntries.length]);

  return {
    contributions,
    isLoading,
    error,
    hasMore: !!currentResponse?.next,
    loadMore,
    refresh: loadContributions,
    isLoadingMore,
    restoredFeedEntries: hasRestoredEntries ? restoredFeedEntries : undefined,
    restoredScrollPosition,
    lastClickedEntryId,
  };
};
