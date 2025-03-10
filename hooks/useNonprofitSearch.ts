'use client';

import { useState, useCallback } from 'react';
import { NonprofitOrg, NonprofitSearchParams } from '@/types/nonprofit';
import { NonprofitService } from '@/services/nonprofit.service';

interface NonprofitSearchState {
  results: NonprofitOrg[];
  isLoading: boolean;
  error: Error | null;
}

interface UseNonprofitSearchReturn {
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
 * @returns Object containing search results, loading state, error state, and search function
 */
export const useNonprofitSearch = (): UseNonprofitSearchReturn => {
  const [state, setState] = useState<NonprofitSearchState>({
    results: [],
    isLoading: false,
    error: null,
  });

  /**
   * Search for nonprofit organizations
   * @param searchTerm - Search term to find matching organizations
   * @param options - Additional search parameters
   */
  const searchNonprofits = useCallback(
    async (searchTerm: string, options: Omit<NonprofitSearchParams, 'searchTerm'> = {}) => {
      if (!searchTerm.trim()) {
        setState((prev) => ({ ...prev, results: [], error: null }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await NonprofitService.searchNonprofitOrgs(searchTerm, options);
        setState({ results, isLoading: false, error: null });
      } catch (error) {
        setState({
          results: [],
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        });
      }
    },
    []
  );

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setState({ results: [], isLoading: false, error: null });
  }, []);

  return {
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    searchNonprofits,
    clearResults,
  };
};
