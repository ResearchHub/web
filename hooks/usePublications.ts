'use client';

import { useState, useCallback } from 'react';
import {
  PublicationService,
  PublicationSearchParams,
  PublicationError,
  AddPublicationsParams,
} from '@/services/publication.service';
import { OpenAlexWork, OpenAlexAuthor, PublicationSearchResponse } from '@/types/publication';

interface UsePublicationsSearchState {
  data: PublicationSearchResponse | null;
  isLoading: boolean;
  error: Error | null;
}

type SearchPublicationsFn = (params: PublicationSearchParams) => Promise<void>;
type SetSelectedAuthorIdFn = (authorId: string | null) => void;
type UsePublicationsSearchReturn = [
  UsePublicationsSearchState,
  SearchPublicationsFn,
  SetSelectedAuthorIdFn,
];

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

  const setSelectedAuthorId = useCallback((authorId: string | null) => {
    setData((prevData) =>
      prevData
        ? {
            ...prevData,
            selectedAuthorId: authorId,
          }
        : null
    );
  }, []);

  return [
    {
      data,
      isLoading,
      error,
    },
    searchPublications,
    setSelectedAuthorId,
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

interface UseClaimProfileState {
  isLoading: boolean;
  error: Error | null;
}

interface ClaimProfileParams {
  authorId: string;
  publicationIds: string[];
  openAlexAuthorId?: string | null;
}

type ClaimProfileFn = (params: ClaimProfileParams) => Promise<void>;
type UseClaimProfileReturn = [UseClaimProfileState, ClaimProfileFn];

/**
 * Hook for claiming an author profile and adding publications
 */
export function useClaimProfile(): UseClaimProfileReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const claimProfile = useCallback(async (params: ClaimProfileParams): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await PublicationService.claimProfileAndAddPublications(params);
    } catch (err) {
      console.error('Error claiming profile:', err);
      const errorMsg = err instanceof PublicationError ? err.message : 'Failed to claim profile';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ isLoading, error }, claimProfile];
}
