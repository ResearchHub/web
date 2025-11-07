'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  PublicationService,
  PublicationSearchParams,
  PublicationError,
  AddPublicationsParams,
  AuthorPublicationsResponse,
} from '@/services/publication.service';
import { OpenAlexWork, OpenAlexAuthor, PublicationSearchResponse } from '@/types/publication';
import { ID } from '@/types/root';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigation, getFeedKey } from '@/contexts/NavigationContext';
import { FeedEntry } from '@/types/feed';

interface UsePublicationsSearchState {
  data: PublicationSearchResponse | null;
  isLoading: boolean;
  error: Error | null;
}

type SearchPublicationsFn = (params: PublicationSearchParams) => Promise<void>;
type SetSelectedAuthorIdFn = (authorId: string | null) => void;
type UsePublicationsSearchReturn = [UsePublicationsSearchState, SearchPublicationsFn];

/**
 * Hook for searching publications by DOI
 */
export function usePublicationsSearch(): UsePublicationsSearchReturn {
  const [data, setData] = useState<PublicationSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchPublications = useCallback(async (params: PublicationSearchParams): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const transformedData = await PublicationService.searchPublications(params);

      // Set publications but put the publication that matches DOI first
      const foundIdx = transformedData.works.findIndex(
        (work) => work.doi?.includes(params.doi) || work.doiUrl?.includes(params.doi)
      );

      if (foundIdx > -1) {
        const publication = transformedData.works[foundIdx];
        transformedData.works.splice(foundIdx, 1);
        transformedData.works.unshift(publication);
      }

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(err instanceof Error ? err : new Error('Failed to search publications'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [
    {
      data,
      isLoading,
      error,
    },
    searchPublications,
  ];
}

interface UseAddPublicationsState {
  isLoading: boolean;
  error: Error | null;
}

type AddPublicationsFn = (params: AddPublicationsParams) => Promise<void>;
type UseAddPublicationsReturn = [UseAddPublicationsState, AddPublicationsFn];

/**
 * Hook for adding publications to a user's profile
 */
export function useAddPublications(): UseAddPublicationsReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const addPublications = useCallback(async (params: AddPublicationsParams): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await PublicationService.addPublications(params);
    } catch (err) {
      console.error('Error adding publications:', err);
      const errorMsg = err instanceof PublicationError ? err.message : 'Failed to add publications';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ isLoading, error }, addPublications];
}

interface UseAuthorPublicationsOptions {
  authorId: ID;
  initialData?: AuthorPublicationsResponse;
  activeTab?: string; // Add activeTab for feed key generation
}

export function useAuthorPublications(options: UseAuthorPublicationsOptions) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isBackNavigation, getFeedState, clearFeedState } = useNavigation();

  // Build query params for feed key
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Check for restored state
  const restoredState = useMemo(() => {
    if (!isBackNavigation) {
      return null;
    }

    const feedKey = getFeedKey({
      pathname,
      tab: options.activeTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    const savedState = getFeedState(feedKey);
    if (savedState) {
      console.log('[useAuthorPublications] Found restored state', {
        feedKey,
        entriesCount: savedState.entries?.length || 0,
        scrollPosition: savedState.scrollPosition,
      });
      clearFeedState(feedKey);
      return savedState;
    }

    return null;
  }, [isBackNavigation, pathname, options.activeTab, queryParams, getFeedState, clearFeedState]);

  // Try to restore publications from FeedEntry[] (we'll need to reverse transform)
  // For now, we'll use initialData if available, otherwise start fresh
  const initialEntries = restoredState?.entries || [];
  const initialHasRestoredEntries = restoredState !== null;
  const restoredScrollPosition = restoredState?.scrollPosition ?? null;
  const lastClickedEntryId = restoredState?.lastClickedEntryId;

  console.log('[useAuthorPublications] Restored state values', {
    initialHasRestoredEntries,
    initialEntriesCount: initialEntries.length,
    restoredScrollPosition,
    restoredStateIsNull: restoredState === null,
    lastClickedEntryId,
  });

  const [publications, setPublications] = useState<any[]>(options.initialData?.results || []);
  const [isLoading, setIsLoading] = useState(!initialHasRestoredEntries && !options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AuthorPublicationsResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);

  // Store restored entries separately for FeedContent to use
  // Preserve hasRestoredEntries in state so it doesn't change when isBackNavigation changes
  const [restoredFeedEntries, setRestoredFeedEntries] = useState<FeedEntry[]>(initialEntries);
  const [hasRestoredEntries, setHasRestoredEntries] = useState<boolean>(initialHasRestoredEntries);

  console.log('[useAuthorPublications] State values', {
    restoredFeedEntriesCount: restoredFeedEntries.length,
    hasRestoredEntries,
    isLoading,
    publicationsCount: publications.length,
  });

  const loadPublications = async () => {
    console.log('[useAuthorPublications] Loading publications');
    setIsLoading(true);
    setError(null);

    try {
      const response = await PublicationService.getAuthorPublications({
        authorId: options.authorId,
      });

      setPublications(response.results);
      setCurrentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load publications'));
      console.error('Error loading publications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update hasRestoredEntries when we have initial entries (from restored state)
  useEffect(() => {
    if (initialHasRestoredEntries && initialEntries.length > 0 && !hasRestoredEntries) {
      console.log('[useAuthorPublications] Setting hasRestoredEntries to true', {
        initialEntriesCount: initialEntries.length,
      });
      setHasRestoredEntries(true);
      setRestoredFeedEntries(initialEntries);
    }
  }, [initialHasRestoredEntries, initialEntries.length, hasRestoredEntries]);

  // Load initial publications
  useEffect(() => {
    console.log('[useAuthorPublications] useEffect triggered', {
      authorId: options.authorId,
      hasRestoredEntries,
      restoredFeedEntriesCount: restoredFeedEntries.length,
      hasInitialData: !!options.initialData,
      willSkipLoad: hasRestoredEntries && restoredFeedEntries.length > 0,
      willUseInitialData: !!options.initialData,
      willCallLoadPublications:
        !(hasRestoredEntries && restoredFeedEntries.length > 0) && !options.initialData,
    });

    // If we have restored entries, skip loading
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      console.log('[useAuthorPublications] Skipping load - using restored entries', {
        restoredFeedEntriesCount: restoredFeedEntries.length,
      });
      return;
    }

    if (options.initialData) {
      console.log('[useAuthorPublications] Skipping load - using initial data');
      return;
    }

    console.log('[useAuthorPublications] Calling loadPublications');
    loadPublications();
  }, [options.authorId, options.initialData]);

  const loadMore = async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await PublicationService.loadMoreAuthorPublications(currentResponse);

      setPublications((prev) => [...prev, ...nextPage.results]);
      setCurrentResponse(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more publications'));
      console.error('Error loading more publications:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    publications,
    isLoading,
    error,
    hasMore: !!currentResponse?.next,
    loadMore,
    refresh: loadPublications,
    isLoadingMore,
    // Add restored state for FeedContent
    restoredFeedEntries: hasRestoredEntries ? restoredFeedEntries : undefined,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}
