'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PublicationService,
  PublicationSearchParams,
  PublicationError,
  AddPublicationsParams,
  AuthorPublicationsResponse,
} from '@/services/publication.service';
import { OpenAlexWork, OpenAlexAuthor, PublicationSearchResponse } from '@/types/publication';
import { ID } from '@/types/root';
import { useFeedStateRestoration } from './useFeedStateRestoration';
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
  const { restoredState, initialEntries, restoredScrollPosition, lastClickedEntryId } =
    useFeedStateRestoration({
      activeTab: options.activeTab,
    });

  const initialHasRestoredEntries = restoredState !== null;

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

  const loadPublications = async () => {
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
    restoredFeedEntries: hasRestoredEntries ? restoredFeedEntries : undefined,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}
