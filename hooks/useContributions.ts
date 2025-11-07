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

  console.log('[useContributions] Hook initialized/re-rendered', {
    isBackNavigation,
    author_id: options.author_id,
    contribution_type: options.contribution_type,
    activeTab: options.activeTab,
    hasInitialData: !!options.initialData,
  });

  // Build query params for feed key
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      // Exclude 'tab' param since it's passed separately as activeTab
      // if (key !== 'tab') {
      params[key] = value;
      // }
    });
    return params;
  }, [searchParams]);

  // Check for restored state
  const restoredState = useMemo(() => {
    console.log('[useContributions] Checking restored state', {
      isBackNavigation,
      author_id: options.author_id,
      pathname,
      activeTab: options.activeTab,
      queryParams,
    });

    if (options.contribution_type === 'ARTICLE') {
      console.log(
        'skipping restored state for articles (publications). there is separa hook for that.'
      );
      return null;
    }

    if (!isBackNavigation || !options.author_id) {
      console.log('[useContributions] No restored state - not back navigation or no author_id', {
        isBackNavigation,
        hasAuthorId: !!options.author_id,
      });
      return null;
    }

    const feedKey = getFeedKey({
      pathname,
      tab: options.activeTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    console.log('[useContributions] Generated feed key', { feedKey });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      console.log('[useContributions] Found restored state', {
        feedKey,
        entriesCount: savedState.entries?.length || 0,
        scrollPosition: savedState.scrollPosition,
        hasEntries: !!savedState.entries && savedState.entries.length > 0,
      });
      clearFeedState(feedKey);
      return savedState;
    }

    console.log('[useContributions] No restored state found for feed key', { feedKey });
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

  // Try to restore contributions from FeedEntry[] (we'll need to reverse transform)
  // For now, we'll use initialData if available, otherwise start fresh
  const initialEntries = restoredState?.entries || [];
  const initialHasRestoredEntries = restoredState !== null;
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId;

  console.log('[useContributions] Restored state values', {
    initialHasRestoredEntries,
    initialEntriesCount: initialEntries.length,
    restoredScrollPosition,
    restoredStateIsNull: restoredState === null,
  });

  // If we have restored entries, we need to transform them back to Contributions
  // This is complex, so for now we'll just use the restored entries count to skip loading
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

  console.log('[useContributions] State values', {
    restoredFeedEntriesCount: restoredFeedEntries.length,
    hasRestoredEntries,
    isLoading,
    contributionsCount: contributions.length,
  });

  const loadContributions = async () => {
    console.log('[useContributions] Loading contributions');
    setIsLoading(true);
    setError(null);

    try {
      const response = await ContributionService.getContributions({
        contribution_type: options.contribution_type,
        author_id: options.author_id,
      });

      // Filter results by checking if they can be parsed and have a valid URL
      const filteredResults = response.results.filter((result) => {
        try {
          const parsed = parseContribution(result);
          if (!parsed) return false;
          getContributionUrl(parsed); // Just to validate, we don't need the URL
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

  // Update hasRestoredEntries when we have initial entries (from restored state)
  useEffect(() => {
    if (initialHasRestoredEntries && initialEntries.length > 0 && !hasRestoredEntries) {
      console.log('[useContributions] Setting hasRestoredEntries to true', {
        initialEntriesCount: initialEntries.length,
      });
      setHasRestoredEntries(true);
      setRestoredFeedEntries(initialEntries);
    }
  }, [initialHasRestoredEntries, initialEntries.length, hasRestoredEntries]);

  // Load initial contributions
  useEffect(() => {
    console.log('[useContributions] useEffect triggered', {
      contribution_type: options.contribution_type,
      author_id: options.author_id,
      hasRestoredEntries,
      restoredFeedEntriesCount: restoredFeedEntries.length,
      hasInitialData: !!options.initialData,
      willSkipLoad: hasRestoredEntries && restoredFeedEntries.length > 0,
      willUseInitialData: !!options.initialData,
      willCallLoadContributions:
        !(hasRestoredEntries && restoredFeedEntries.length > 0) && !options.initialData,
    });

    // If we have restored entries, skip loading
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      console.log('[useContributions] Skipping load - using restored entries', {
        restoredFeedEntriesCount: restoredFeedEntries.length,
      });
      return;
    }

    if (options.initialData) {
      console.log('[useContributions] Skipping load - using initial data');
      return;
    }

    console.log('[useContributions] Calling loadContributions');
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
    // Don't clear restored entries if we have restored state - preserve them
    // Check restoredFeedEntries.length instead of initialEntries because
    // restoredFeedEntries is preserved in state and won't change when isBackNavigation changes
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      console.log('[useContributions] Skipping clear - preserving restored entries', {
        contribution_type: options.contribution_type,
        restoredFeedEntriesCount: restoredFeedEntries.length,
      });
      return;
    }

    console.log('[useContributions] contribution_type changed, clearing state', {
      contribution_type: options.contribution_type,
      hasRestoredEntries,
      restoredFeedEntriesCount: restoredFeedEntries.length,
    });
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
    // Add restored state for FeedContent
    restoredFeedEntries: hasRestoredEntries ? restoredFeedEntries : undefined,
    restoredScrollPosition,
    lastClickedEntryId,
  };
};
