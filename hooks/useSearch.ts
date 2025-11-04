'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchService } from '@/services/search.service';
import { FeedEntry } from '@/types/feed';
import {
  OpenSearchPerson,
  OpenSearchResponse,
  SearchFilters,
  SearchSortOption,
} from '@/types/search';

interface UseSearchOptions {
  pageSize?: number;
}

interface UseSearchReturn {
  entries: FeedEntry[];
  people: OpenSearchPerson[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  aggregations: OpenSearchResponse['aggregations'] | null;
  filters: SearchFilters;
  stagedFilters: SearchFilters;
  sortBy: SearchSortOption;
  setFilters: (filters: SearchFilters) => void;
  setStagedFilters: (filters: SearchFilters) => void;
  applyFilters: () => void;
  hasUnappliedChanges: boolean;
  setSortBy: (sort: SearchSortOption) => void;
  search: (query: string, tab: 'documents' | 'people') => Promise<void>;
}

const STORAGE_KEY = 'search-preferences';

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [people, setPeople] = useState<OpenSearchPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [aggregations, setAggregations] = useState<OpenSearchResponse['aggregations'] | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'documents' | 'people'>('documents');

  // Load preferences from localStorage
  const [filters, setFiltersState] = useState<SearchFilters>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.filters || {};
        }
      } catch (error) {
        console.warn('Failed to load search preferences:', error);
      }
    }
    return {};
  });

  // Staged filters (not yet applied)
  const [stagedFilters, setStagedFiltersState] = useState<SearchFilters>(filters);

  const [sortBy, setSortByState] = useState<SearchSortOption>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.sortBy || 'relevance';
        }
      } catch (error) {
        console.warn('Failed to load search preferences:', error);
      }
    }
    return 'relevance';
  });

  // Check if there are unapplied changes
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(stagedFilters);

  // Save preferences to localStorage
  const savePreferences = useCallback((newFilters: SearchFilters, newSortBy: SearchSortOption) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            filters: newFilters,
            sortBy: newSortBy,
          })
        );
      } catch (error) {
        console.warn('Failed to save search preferences:', error);
      }
    }
  }, []);

  const setFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFiltersState(newFilters);
      setStagedFiltersState(newFilters);
      savePreferences(newFilters, sortBy);
    },
    [sortBy, savePreferences]
  );

  const setStagedFilters = useCallback((newFilters: SearchFilters) => {
    setStagedFiltersState(newFilters);
  }, []);

  const applyFilters = useCallback(() => {
    setFiltersState(stagedFilters);
    savePreferences(stagedFilters, sortBy);
  }, [stagedFilters, sortBy, savePreferences]);

  const setSortBy = useCallback(
    (newSortBy: SearchSortOption) => {
      setSortByState(newSortBy);
      savePreferences(filters, newSortBy);
    },
    [filters, savePreferences]
  );

  const search = useCallback(
    async (query: string, tab: 'documents' | 'people') => {
      if (!query.trim()) {
        setEntries([]);
        setPeople([]);
        setAggregations(null);
        setHasMore(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentQuery(query);
      setCurrentTab(tab);
      setPage(1);

      try {
        // Always use 'relevance' for backend search
        const response = await SearchService.fullSearch({
          query,
          page: 1,
          pageSize: options.pageSize || 20,
          filters,
          sortBy: 'relevance',
        });

        if (tab === 'documents') {
          setEntries(response.entries);
        } else {
          setPeople(response.people);
        }

        setAggregations(response.aggregations);
        setHasMore(response.hasMore);
        setError(null);
      } catch (error) {
        console.error('Search error:', error);
        setEntries([]);
        setPeople([]);
        setAggregations(null);
        setHasMore(false);
        setError("We're experiencing issues with search right now. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, options.pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !currentQuery.trim()) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      // Always use 'relevance' for backend search
      const response = await SearchService.fullSearch({
        query: currentQuery,
        page: nextPage,
        pageSize: options.pageSize || 20,
        filters,
        sortBy: 'relevance',
      });

      if (currentTab === 'documents') {
        setEntries((prev) => [...prev, ...response.entries]);
      } else {
        setPeople((prev) => [...prev, ...response.people]);
      }

      setHasMore(response.hasMore);
      setPage(nextPage);
      setError(null);
    } catch (error) {
      console.error('Load more error:', error);
      setError("We're experiencing issues loading more results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, currentQuery, page, filters, currentTab, options.pageSize]);

  // Debounced search effect - only re-search when filters change, not sortBy
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentQuery.trim()) {
        search(currentQuery, currentTab);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuery, currentTab, filters, search]);

  // Frontend sorting - sort the already-fetched results
  const sortEntries = useCallback(
    (entriesToSort: FeedEntry[]) => {
      const sorted = [...entriesToSort];

      switch (sortBy) {
        case 'newest':
          return sorted.sort((a, b) => {
            // Use content.createdDate for the actual creation date
            const dateA = new Date(a.content.createdDate || a.timestamp || 0).getTime();
            const dateB = new Date(b.content.createdDate || b.timestamp || 0).getTime();
            return dateB - dateA;
          });

        case 'hot':
          return sorted.sort((a, b) => {
            const scoreA = a.hotScoreV2 || a.metrics?.votes || 0;
            const scoreB = b.hotScoreV2 || b.metrics?.votes || 0;
            return scoreB - scoreA;
          });

        case 'upvoted':
          return sorted.sort((a, b) => {
            const votesA = a.metrics?.votes || 0;
            const votesB = b.metrics?.votes || 0;
            return votesB - votesA;
          });

        case 'relevance':
        default:
          // Keep original order (relevance from backend)
          return sorted;
      }
    },
    [sortBy]
  );

  const sortPeople = useCallback(
    (peopleToSort: OpenSearchPerson[]) => {
      const sorted = [...peopleToSort];

      switch (sortBy) {
        case 'upvoted':
          return sorted.sort((a, b) => {
            const repA = a.user_reputation || 0;
            const repB = b.user_reputation || 0;
            return repB - repA;
          });

        case 'relevance':
        default:
          // Keep original order (relevance from backend)
          return sorted;
      }
    },
    [sortBy]
  );

  // Apply sorting to results
  const sortedEntries = sortEntries(entries);
  const sortedPeople = sortPeople(people);

  return {
    entries: sortedEntries,
    people: sortedPeople,
    isLoading,
    error,
    hasMore,
    loadMore,
    aggregations,
    filters,
    stagedFilters,
    sortBy,
    setFilters,
    setStagedFilters,
    applyFilters,
    hasUnappliedChanges,
    setSortBy,
    search,
  };
}
