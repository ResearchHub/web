'use client';

import { useState, useCallback, useEffect } from 'react';
import { NonprofitOrg, NonprofitSearchParams } from '@/types/nonprofit';
import { NonprofitService } from '@/services/nonprofit.service';

export interface UseNonprofitSearchOptions {
  initialSearchTerm?: string;
  initialSearchOptions?: Omit<NonprofitSearchParams, 'searchTerm'>;
  performInitialSearch?: boolean;
}

export interface UseNonprofitSearchReturn {
  results: NonprofitOrg[];
  isLoading: boolean;
  error: Error | null;
  searchNonprofits: (
    searchTerm: string,
    options?: Omit<NonprofitSearchParams, 'searchTerm'>
  ) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for searching nonprofit organizations
 *
 * @param options - Optional configuration for the hook
 * @param options.initialSearchTerm - Initial search term to use on mount
 * @param options.initialSearchOptions - Initial search options to use on mount
 * @param options.performInitialSearch - Whether to perform search on mount with initial values
 * @returns Object containing search results, loading state, error state, and search functions
 */
export const useNonprofitSearch = (
  options: UseNonprofitSearchOptions = {}
): UseNonprofitSearchReturn => {
  const [results, setResults] = useState<NonprofitOrg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    initialSearchTerm = '',
    initialSearchOptions = {},
    performInitialSearch = false,
  } = options;

  /**
   * Search for nonprofit organizations
   *
   * @param searchTerm - Search term to find matching organizations
   * @param options - Additional search parameters
   * @returns Promise that resolves when search is complete and state is updated
   */
  const searchNonprofits = useCallback(
    async (
      searchTerm: string,
      options: Omit<NonprofitSearchParams, 'searchTerm'> = {}
    ): Promise<void> => {
      if (!searchTerm.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await NonprofitService.searchNonprofitOrgs(searchTerm, options);
        setResults(searchResults);
      } catch (error) {
        setResults([]);

        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error('Unknown error occurred while searching for nonprofits'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback((): void => {
    setResults([]);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (performInitialSearch && initialSearchTerm.trim()) {
      searchNonprofits(initialSearchTerm, initialSearchOptions);
    }
  }, [performInitialSearch, initialSearchTerm, initialSearchOptions, searchNonprofits]);

  return {
    results,
    isLoading,
    error,
    searchNonprofits,
    clearResults,
  };
};
