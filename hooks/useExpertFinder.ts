'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ExpertFinderService,
  type ExpertSearchCreatePayload,
} from '@/services/expertFinder.service';
import type {
  ExpertSearchCreated,
  ExpertSearchResult,
  ExpertSearchListItem,
} from '@/types/expertFinder';

// ── useExpertSearchDetail ────────────────────────────────────────────────────

interface UseExpertSearchDetailState {
  searchDetail: ExpertSearchResult | null;
  isLoading: boolean;
  error: string | null;
}

type FetchExpertSearchDetailFn = () => Promise<void>;
type UseExpertSearchDetailReturn = [UseExpertSearchDetailState, FetchExpertSearchDetailFn];

/**
 * Fetches a single expert search by id.
 */
export function useExpertSearchDetail(
  searchId: number | string | null
): UseExpertSearchDetailReturn {
  const [searchDetail, setSearchDetail] = useState<ExpertSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (searchId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const detail = await ExpertFinderService.getSearch(searchId);
      setSearchDetail(detail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch search detail';
      setError(message);
      setSearchDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchId]);

  useEffect(() => {
    if (searchId != null) {
      fetch();
    } else {
      setSearchDetail(null);
      setError(null);
    }
  }, [searchId, fetch]);

  return [{ searchDetail, isLoading, error }, fetch];
}

// ── useExpertSearches ─────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

interface UseExpertSearchesState {
  searches: ExpertSearchListItem[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

interface UseExpertSearchesParams {
  limit?: number;
  offset?: number;
}

type FetchExpertSearchesFn = (params?: UseExpertSearchesParams) => Promise<void>;
type UseExpertSearchesReturn = [UseExpertSearchesState, FetchExpertSearchesFn];

/**
 * Lists expert searches with pagination.
 */
export function useExpertSearches(params?: UseExpertSearchesParams): UseExpertSearchesReturn {
  const limit = params?.limit ?? 10;
  const offset = params?.offset ?? 0;

  const [searches, setSearches] = useState<ExpertSearchListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (fetchParams?: UseExpertSearchesParams) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await ExpertFinderService.listSearches(fetchParams ?? params);
        setSearches(response.searches);
        setPagination({
          total: response.total,
          limit: response.limit,
          offset: response.offset,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch expert searches';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [params?.limit, params?.offset]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return [{ searches, pagination, isLoading, error }, fetch];
}

// ── useCreateExpertSearch ─────────────────────────────────────────────────────

interface UseCreateExpertSearchState {
  created: ExpertSearchCreated | null;
  isLoading: boolean;
  error: string | null;
}

type CreateExpertSearchFn = (payload: ExpertSearchCreatePayload) => Promise<ExpertSearchCreated>;
type UseCreateExpertSearchReturn = [UseCreateExpertSearchState, CreateExpertSearchFn];

/**
 * Create a new expert search.
 */
export function useCreateExpertSearch(): UseCreateExpertSearchReturn {
  const [created, setCreated] = useState<ExpertSearchCreated | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSearch = useCallback(
    async (payload: ExpertSearchCreatePayload): Promise<ExpertSearchCreated> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ExpertFinderService.createSearch(payload);
        setCreated(response);
        return response;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create expert search';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return [{ created, isLoading, error }, createSearch];
}
