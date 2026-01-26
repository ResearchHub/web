import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { SearchService } from '@/services/search.service';
import { SearchSuggestion } from '@/types/search';
import { getSearchHistory, SEARCH_HISTORY_KEY } from '@/utils/searchHistory';
import { EntityType } from '@/types/search';

interface UseSearchSuggestionsConfig {
  query: string;
  indices?: EntityType | EntityType[];
  includeLocalSuggestions?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
  externalSearch?: boolean;
}

export function useSearchSuggestions({
  query,
  indices,
  includeLocalSuggestions = false,
  debounceMs = 300,
  minQueryLength = 2,
  externalSearch = false,
}: UseSearchSuggestionsConfig) {
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<SearchSuggestion[]>([]);
  const [localSuggestions, setLocalSuggestions] = useState<SearchSuggestion[]>([]);

  // Load local suggestions from localStorage only if enabled
  useEffect(() => {
    if (!includeLocalSuggestions) return;

    // Initial load
    const history = getSearchHistory();
    setLocalSuggestions(history);

    // Listen for changes
    const handleStorageChange = () => {
      const updatedHistory = getSearchHistory();
      setLocalSuggestions(updatedHistory);
    };

    window.addEventListener('search-history-updated', handleStorageChange);
    return () => {
      window.removeEventListener('search-history-updated', handleStorageChange);
    };
  }, [includeLocalSuggestions]);

  // Filter local suggestions based on query
  const filteredLocalSuggestions = useMemo(() => {
    if (!includeLocalSuggestions || !query) return [];

    const lowerQuery = query.toLowerCase();
    return localSuggestions.filter((suggestion) => {
      if (suggestion.entityType === 'paper') {
        return (
          suggestion.displayName.toLowerCase().includes(lowerQuery) ||
          suggestion.authors.some((author) => author.toLowerCase().includes(lowerQuery)) ||
          suggestion.doi?.toLowerCase().includes(lowerQuery)
        );
      } else if (suggestion.entityType === 'user' || suggestion.entityType === 'author') {
        return suggestion.displayName.toLowerCase().includes(lowerQuery);
      } else if (suggestion.entityType === 'post') {
        return suggestion.displayName.toLowerCase().includes(lowerQuery);
      }
      return false;
    });
  }, [localSuggestions, query, includeLocalSuggestions]);

  // Fetch suggestions function - memoized with useCallback
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      try {
        console.log(
          '[SearchSuggestions] 🔍 Fetching suggestions for query:',
          searchQuery,
          'timestamp:',
          Date.now()
        );
        const suggestions = await SearchService.getSuggestions(
          searchQuery,
          indices,
          undefined,
          externalSearch
        );
        setApiSuggestions(suggestions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setApiSuggestions([]);
        setLoading(false);
      }
    },
    [indices, externalSearch]
  );

  // Fetch API suggestions when query changes
  useEffect(() => {
    // If query doesn't meet minimum length, clear results and don't search
    if (!query || query.length < minQueryLength) {
      setApiSuggestions([]);
      setLoading(false);
      return;
    }

    // Set loading immediately when query changes (before debounce)
    // This prevents the brief "No results found" flash
    setLoading(true);

    // Create debounced function - it will capture the current query value
    const debouncedFetch = debounce(() => fetchSuggestions(query), debounceMs);

    // Call the debounced function
    debouncedFetch();

    return () => {
      // Cancel any pending debounced call on cleanup
      debouncedFetch.cancel();
    };
  }, [query, minQueryLength, debounceMs, fetchSuggestions]);

  useEffect(() => {
    console.log('useEffect mount');
    return () => {
      console.log('useEffect unmount');
    };
  }, []);

  // Combine suggestions, prioritizing local results if enabled
  const suggestions = useMemo(() => {
    let results: SearchSuggestion[] = [];

    // Add local suggestions if enabled
    if (includeLocalSuggestions) {
      if (!query) {
        results = localSuggestions;
      } else {
        results = [...filteredLocalSuggestions];
      }

      // Add API suggestions, excluding any that match local suggestions by ID or DOI
      if (query) {
        const existingIds = new Set(results.map((s) => s.id));
        const existingDois = new Set(
          results
            .filter((s): s is Extract<SearchSuggestion, { doi: string }> => 'doi' in s)
            .map((s) => s.doi)
        );

        const uniqueApiSuggestions = apiSuggestions.filter((s) => {
          if (s.entityType === 'paper') {
            return !existingIds.has(s.id) && !existingDois.has(s.doi);
          }
          return !existingIds.has(s.id);
        });

        results.push(...uniqueApiSuggestions);
      }
    } else {
      // If local suggestions are disabled, just use API suggestions
      results = apiSuggestions;
    }

    // Don't group results by entity type anymore, just return them in their original order
    return results;
  }, [query, filteredLocalSuggestions, apiSuggestions, localSuggestions, includeLocalSuggestions]);

  // Clear all search history
  const clearSearchHistory = () => {
    if (!includeLocalSuggestions) return;
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setLocalSuggestions([]);
  };

  return {
    loading,
    suggestions,
    isFocused,
    setIsFocused,
    hasLocalSuggestions: includeLocalSuggestions && localSuggestions.length > 0,
    clearSearchHistory,
  };
}
