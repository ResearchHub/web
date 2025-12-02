'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { SearchService } from '@/services/search.service';
import { FeedEntry } from '@/types/feed';
import {
  PersonSearchResult,
  SearchResponse,
  SearchFilters,
  SearchSortOption,
} from '@/types/search';

interface UseSearchOptions {
  pageSize?: number;
}

interface UseSearchReturn {
  entries: FeedEntry[];
  people: PersonSearchResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  count: number;
  loadMore: () => void;
  aggregations: SearchResponse['aggregations'] | null;
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
  const [people, setPeople] = useState<PersonSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [aggregations, setAggregations] = useState<SearchResponse['aggregations'] | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'documents' | 'people'>('documents');
  const isLoadingRef = useRef(false);

  // Load preferences from localStorage
  const [filters, setFiltersState] = useState<SearchFilters>(() => {
    if (globalThis.window !== undefined) {
      try {
        const stored = globalThis.window.localStorage.getItem(STORAGE_KEY);
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
  const [stagedFilters, setStagedFiltersState] = useState<SearchFilters>(() => filters);

  // Always default to 'relevance' - no longer stored in localStorage
  const [sortBy, setSortByState] = useState<SearchSortOption>('relevance');

  // Check if there are unapplied changes
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(stagedFilters);

  // Save filters to localStorage (sortBy is no longer persisted)
  const savePreferences = useCallback((newFilters: SearchFilters) => {
    if (typeof globalThis.window !== 'undefined') {
      try {
        globalThis.window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            filters: newFilters,
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
      savePreferences(newFilters);
    },
    [savePreferences]
  );

  const setStagedFilters = useCallback((newFilters: SearchFilters) => {
    setStagedFiltersState(newFilters);
  }, []);

  const applyFilters = useCallback(() => {
    setFiltersState(stagedFilters);
    savePreferences(stagedFilters);
  }, [stagedFilters, savePreferences]);

  const setSortBy = useCallback((newSortBy: SearchSortOption) => {
    setSortByState(newSortBy);
    // No longer saving sortBy to localStorage
  }, []);

  const search = useCallback(
    async (query: string, tab: 'documents' | 'people') => {
      if (!query.trim()) {
        setEntries([]);
        setPeople([]);
        setAggregations(null);
        setHasMore(false);
        setCount(0);
        setError(null);
        return;
      }

      isLoadingRef.current = false; // Reset the ref for new search
      setIsLoadingMore(false);
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
          pageSize: options.pageSize || 40,
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
        setCount(response.count || 0);
        setError(null);
      } catch (error) {
        console.error('Search error:', error);
        setEntries([]);
        setPeople([]);
        setAggregations(null);
        setHasMore(false);
        setCount(0);
        setError("We're experiencing issues with search right now. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, options.pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current || !currentQuery.trim()) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      // Always use 'relevance' for backend search
      const response = await SearchService.fullSearch({
        query: currentQuery,
        page: nextPage,
        pageSize: options.pageSize || 40,
        filters,
        sortBy: 'relevance',
      });

      // If we get no new results, stop pagination
      const hasNewResults =
        currentTab === 'documents' ? response.entries.length > 0 : response.people.length > 0;

      if (!hasNewResults) {
        setHasMore(false);
        setIsLoading(false);
        setIsLoadingMore(false);
        isLoadingRef.current = false;
        return;
      }

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
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [hasMore, currentQuery, page, filters, currentTab, options.pageSize]);

  // Debounced search effect - only re-search when filters change, not sortBy or query
  // Query changes are handled by direct calls to search() from components
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (currentQuery.trim()) {
        search(currentQuery, currentTab);
      }
    }, 300);

    debouncedSearch();

    return () => debouncedSearch.cancel();
  }, [filters, search]);

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
    (peopleToSort: PersonSearchResult[]) => {
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
    isLoadingMore,
    error,
    hasMore,
    count,
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
