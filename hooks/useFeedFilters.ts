import { useState, useEffect, useRef, useCallback } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

const FEED_FILTERS_STORAGE_KEY = 'researchhub_feed_filters';

export interface FeedFilters {
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedSources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  useMlScoring: boolean;
  hasEnrichment: boolean;
}

const DEFAULT_FILTERS: FeedFilters = {
  selectedCategories: [],
  selectedSubcategories: [],
  selectedSources: [],
  keywords: [],
  timePeriod: 'LAST_WEEK',
  sortBy: 'best',
  useMlScoring: true, // Changed from false to true - ML scoring on by default
  hasEnrichment: true, // Default to true - enriched data on by default
};

export function useFeedFilters() {
  const { preferences, updatePreferences } = usePreferences();
  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FILTERS);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<FeedFilters>(DEFAULT_FILTERS);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FEED_FILTERS_STORAGE_KEY);

      // Check if user just completed onboarding (within the last minute)
      const justCompletedOnboarding =
        preferences?.completedAt &&
        new Date(preferences.completedAt).getTime() > Date.now() - 60000;

      if (justCompletedOnboarding && preferences) {
        // User just completed onboarding - use their selections
        const initialFilters = {
          ...DEFAULT_FILTERS,
          selectedCategories: preferences.selectedCategories || [],
          selectedSubcategories: preferences.selectedSubcategories || [],
          useMlScoring: preferences.useMlScoring ?? true,
        };
        setFilters(initialFilters);
        setDebouncedFilters(initialFilters);
        // Save these as the new filters
        localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(initialFilters));
      } else if (savedFilters) {
        // Use saved filters from previous sessions
        const parsed: FeedFilters = JSON.parse(savedFilters);
        setFilters(parsed);
        setDebouncedFilters(parsed);
      } else if (preferences) {
        // First time visiting feed (no saved filters, but has preferences)
        const initialFilters = {
          ...DEFAULT_FILTERS,
          selectedCategories: preferences.selectedCategories || [],
          selectedSubcategories: preferences.selectedSubcategories || [],
          useMlScoring: preferences.useMlScoring ?? true,
        };
        setFilters(initialFilters);
        setDebouncedFilters(initialFilters);
      } else {
        // No saved filters and no preferences - use defaults
        setFilters(DEFAULT_FILTERS);
        setDebouncedFilters(DEFAULT_FILTERS);
      }
      setFiltersInitialized(true);
    } catch (error) {
      console.error('Error loading feed filters:', error);
      setFiltersInitialized(true);
    }
  }, [preferences]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (filtersInitialized) {
      try {
        localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error('Error saving feed filters:', error);
      }
    }
  }, [filters, filtersInitialized]);

  // Update preferences context when ML scoring changes
  useEffect(() => {
    if (filtersInitialized && preferences) {
      updatePreferences({ useMlScoring: filters.useMlScoring });
    }
  }, [filters.useMlScoring, filtersInitialized]);

  // Debounce filter updates
  useEffect(() => {
    if (filtersInitialized) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedFilters(filters);
      }, 300);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [filters, filtersInitialized]);

  const updateFilters = useCallback((updates: Partial<FeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const isUpdating = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);

  const activeFilterCount =
    filters.selectedCategories.length +
    filters.selectedSubcategories.length +
    filters.selectedSources.length +
    filters.keywords.length;

  return {
    filters,
    debouncedFilters,
    updateFilters,
    clearFilters,
    isUpdating,
    activeFilterCount,
    filtersInitialized,
  };
}
