import { useState, useEffect, useMemo } from 'react';
import { SearchService } from '@/services/search.service';
import { SearchSuggestion } from '@/types/search';
import { getSearchHistory, saveSearchHistory, SEARCH_HISTORY_KEY } from '@/utils/searchHistory';
import { EntityType } from '@/types/search';

interface UseSearchSuggestionsConfig {
  query: string;
  indices?: EntityType | EntityType[];
  includeLocalSuggestions?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
}

export function useSearchSuggestions({
  query,
  indices,
  includeLocalSuggestions = false,
  debounceMs = 300,
  minQueryLength = 2,
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

  // Fetch API suggestions when query changes
  useEffect(() => {
    let mounted = true;
    const fetchSuggestions = async () => {
      if (!query || query.length < minQueryLength) {
        setApiSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const suggestions = await SearchService.getSuggestions(query, indices);
        if (mounted) {
          setApiSuggestions(suggestions);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        if (mounted) {
          setApiSuggestions([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, debounceMs);
    return () => {
      mounted = false;
      clearTimeout(debounceTimer);
    };
  }, [query, indices, minQueryLength, debounceMs]);

  // Combine suggestions, prioritizing local results if enabled
  const suggestions = useMemo(() => {
    if (!isFocused) return [];

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

    // Group results by entity type
    const groupedResults: SearchSuggestion[] = [];
    const papers = results.filter((s) => s.entityType === 'paper');
    const users = results.filter((s) => s.entityType === 'user');
    const authors = results.filter((s) => s.entityType === 'author');
    const posts = results.filter((s) => s.entityType === 'post');

    if (papers.length) groupedResults.push(...papers);
    if (users.length) groupedResults.push(...users);
    if (authors.length) groupedResults.push(...authors);
    if (posts.length) groupedResults.push(...posts);

    return groupedResults;
  }, [
    isFocused,
    query,
    filteredLocalSuggestions,
    apiSuggestions,
    localSuggestions,
    includeLocalSuggestions,
  ]);

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
