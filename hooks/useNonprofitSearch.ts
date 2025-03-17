'use client';

import { useState, useCallback, useEffect } from 'react';
import { NonprofitOrg, NonprofitSearchParams } from '@/types/nonprofit';
import { NonprofitService } from '@/services/nonprofit.service';
import { isFeatureEnabled } from '@/utils/featureFlags';

interface NonprofitSearchState {
  results: NonprofitOrg[];
  isLoading: boolean;
  error: Error | null;
  isFeatureEnabled: boolean;
}

interface UseNonprofitSearchReturn {
  results: NonprofitOrg[];
  isLoading: boolean;
  error: Error | null;
  isFeatureEnabled: boolean;
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
    isFeatureEnabled: false,
  });

  // Check if the feature is enabled on mount
  useEffect(() => {
    try {
      setState((prev) => ({ ...prev, isFeatureEnabled: isFeatureEnabled('nonprofitIntegration') }));
    } catch (err) {
      console.error('Error checking feature flag:', err);
      setState((prev) => ({ ...prev, isFeatureEnabled: false }));
    }
  }, []);

  /**
   * Search for nonprofit organizations
   * @param searchTerm - Search term to find matching organizations
   * @param options - Additional search parameters
   */
  const searchNonprofits = useCallback(
    async (searchTerm: string, options: Omit<NonprofitSearchParams, 'searchTerm'> = {}) => {
      // Check if feature is enabled before proceeding
      if (!state.isFeatureEnabled) {
        setState((prev) => ({
          ...prev,
          error: new Error('Nonprofit integration is not available in this environment'),
        }));
        return;
      }

      if (!searchTerm.trim()) {
        setState((prev) => ({ ...prev, results: [], error: null }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await NonprofitService.searchNonprofitOrgs(searchTerm, options);
        setState((prev) => ({ ...prev, results, isLoading: false, error: null }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          results: [],
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        }));
      }
    },
    [state.isFeatureEnabled]
  );

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, results: [], isLoading: false, error: null }));
  }, []);

  return {
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    isFeatureEnabled: state.isFeatureEnabled,
    searchNonprofits,
    clearResults,
  };
};
