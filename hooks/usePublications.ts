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
}

interface UseAuthorPublicationsState {
  publications: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
}

export function useAuthorPublications(options: UseAuthorPublicationsOptions) {
  const [publications, setPublications] = useState<any[]>(options.initialData?.results || []);
  const [isLoading, setIsLoading] = useState(!options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AuthorPublicationsResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);

  // Load initial publications
  useEffect(() => {
    if (options.initialData) {
      return;
    }

    loadPublications();
  }, [options.authorId]);

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
  };
}
