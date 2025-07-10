'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAPERS, PaperSearchResponse } from '@/lib/graphql/queries';
import { mapGraphQLPaperToWork } from '@/lib/graphql/mappers';
import { TransformedWork } from '@/types/work';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { AdvancedFilter } from '@/components/Feed/AdvancedFilter';
import { PaperCard } from '@/components/Feed/PaperCard';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import {
  ChevronDown,
  TrendingUp,
  Quote,
  Clock,
  Calendar,
  Settings,
  Sparkles,
  Search,
} from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { usePreferences } from '@/contexts/PreferencesContext';

const FEED_FILTERS_STORAGE_KEY = 'researchhub_feed_filters';

interface FeedFilters {
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedSources: string[];
  keywords: string[];
  timePeriod: string;
  sortBy: string;
  useMlScoring: boolean;
}

function FeedContent() {
  const { preferences, updatePreferences } = usePreferences();

  // Initialize state from localStorage or fall back to onboarding preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>('LAST_WEEK');
  const [sortBy, setSortBy] = useState<string>('best');
  const [useMlScoring, setUseMlScoring] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [offset, setOffset] = useState<number>(0);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const limit = 20;

  // Debounced filter state for the query
  const [debouncedFilters, setDebouncedFilters] = useState({
    selectedCategories: [] as string[],
    selectedSubcategories: [] as string[],
    selectedSources: [] as string[],
    keywords: [] as string[],
    timePeriod: 'LAST_WEEK',
    sortBy: 'best',
    useMlScoring: false,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FEED_FILTERS_STORAGE_KEY);
      if (savedFilters) {
        // User has visited before, use their saved filters
        const filters: FeedFilters = JSON.parse(savedFilters);
        setSelectedCategories(filters.selectedCategories || []);
        setSelectedSubcategories(filters.selectedSubcategories || []);
        setSelectedSources(filters.selectedSources || []);
        setKeywords(filters.keywords || []);
        setTimePeriod(filters.timePeriod || 'LAST_WEEK');
        setSortBy(filters.sortBy || 'best');
        setUseMlScoring(filters.useMlScoring || false);
      } else if (preferences) {
        // First time visiting feed after onboarding, use onboarding preferences
        setSelectedCategories(preferences.selectedCategories || []);
        setSelectedSubcategories(preferences.selectedSubcategories || []);
        setUseMlScoring(preferences.useMlScoring || false);
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
        const filters: FeedFilters = {
          selectedCategories,
          selectedSubcategories,
          selectedSources,
          keywords,
          timePeriod,
          sortBy,
          useMlScoring,
        };
        localStorage.setItem(FEED_FILTERS_STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error('Error saving feed filters:', error);
      }
    }
  }, [
    selectedCategories,
    selectedSubcategories,
    selectedSources,
    keywords,
    timePeriod,
    sortBy,
    useMlScoring,
    filtersInitialized,
  ]);

  // Update preferences context when ML scoring changes
  useEffect(() => {
    if (filtersInitialized && preferences) {
      updatePreferences({ useMlScoring });
    }
  }, [useMlScoring, filtersInitialized]);

  // Debounce filter updates for the query
  useEffect(() => {
    if (filtersInitialized) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedFilters({
          selectedCategories,
          selectedSubcategories,
          selectedSources,
          keywords,
          timePeriod,
          sortBy,
          useMlScoring,
        });
      }, 300); // 300ms delay

      // Cleanup
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [
    selectedCategories,
    selectedSubcategories,
    selectedSources,
    keywords,
    timePeriod,
    sortBy,
    useMlScoring,
    filtersInitialized,
  ]);

  // Track if filters are different from debounced filters (updating)
  const isFiltersUpdating =
    JSON.stringify({
      selectedCategories,
      selectedSubcategories,
      selectedSources,
      keywords,
      timePeriod,
      sortBy,
      useMlScoring,
    }) !== JSON.stringify(debouncedFilters);

  const sortOptions = [
    { value: 'best', label: 'Best', icon: Sparkles },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
  ];

  const timePeriodOptions = [
    { value: 'LAST_24H', label: 'Last 24 hours' },
    { value: 'LAST_3_DAYS', label: 'Last 3 days' },
    { value: 'LAST_WEEK', label: 'Last week' },
    { value: 'LAST_MONTH', label: 'Last month' },
    { value: 'LAST_3_MONTHS', label: 'Last 3 months' },
    { value: 'LAST_YEAR', label: 'Last year' },
    { value: 'ALL_TIME', label: 'All time' },
  ];

  const mapSortToGraphQL = (sort: string): { sortBy: string; sortOrder: string } => {
    switch (sort) {
      case 'best':
        return { sortBy: 'RELEVANCE', sortOrder: 'DESC' };
      case 'trending':
        return { sortBy: 'IMPACT_SCORE', sortOrder: 'DESC' };
      case 'newest':
        return { sortBy: 'DATE', sortOrder: 'DESC' };
      default:
        return { sortBy: 'DATE', sortOrder: 'DESC' };
    }
  };

  const { sortBy: graphqlSortBy, sortOrder } = mapSortToGraphQL(debouncedFilters.sortBy);

  const { loading, error, data, fetchMore } = useQuery<{
    getPapers: PaperSearchResponse;
  }>(GET_PAPERS, {
    skip: !filtersInitialized,
    variables: {
      input: {
        ...(debouncedFilters.selectedCategories.length > 0 && {
          categories: debouncedFilters.selectedCategories,
        }),
        ...(debouncedFilters.selectedSubcategories.length > 0 && {
          subcategories: debouncedFilters.selectedSubcategories,
        }),
        ...(debouncedFilters.selectedSources.length > 0 && {
          sources: debouncedFilters.selectedSources,
        }),
        ...(debouncedFilters.keywords.length > 0 && { keywords: debouncedFilters.keywords }),
        timePeriod: debouncedFilters.timePeriod,
        sortBy: graphqlSortBy,
        sortOrder,
        hasEnrichment: true,
        useMlScoring: debouncedFilters.useMlScoring,
        limit,
        offset,
      },
    },
  });

  const handleFilterChange = useCallback(
    (filters: {
      categories: string[];
      subcategories: string[];
      sources: string[];
      keywords: string[];
      timePeriod: string;
      sortBy: string;
      useMlScoring: boolean;
    }) => {
      setSelectedCategories(filters.categories);
      setSelectedSubcategories(filters.subcategories);
      setSelectedSources(filters.sources);
      setKeywords(filters.keywords);
      setTimePeriod(filters.timePeriod);
      setSortBy(filters.sortBy);
      setUseMlScoring(filters.useMlScoring);
      setOffset(0); // Reset pagination when filters change
    },
    []
  );

  const handleCategoryClick = (categorySlug: string) => {
    if (!selectedCategories.includes(categorySlug)) {
      setSelectedCategories([...selectedCategories, categorySlug]);
      setOffset(0);
    }
  };

  const handleSubcategoryClick = (subcategorySlug: string) => {
    if (!selectedSubcategories.includes(subcategorySlug)) {
      setSelectedSubcategories([...selectedSubcategories, subcategorySlug]);
      setOffset(0);
    }
  };

  const handleSourceClick = (source: string) => {
    if (!selectedSources.includes(source)) {
      setSelectedSources([...selectedSources, source]);
      setOffset(0);
    }
  };

  const loadMore = () => {
    const newOffset = offset + limit;
    const { sortBy: newSortBy, sortOrder: newSortOrder } = mapSortToGraphQL(
      debouncedFilters.sortBy
    );

    fetchMore({
      variables: {
        input: {
          ...(debouncedFilters.selectedCategories.length > 0 && {
            categories: debouncedFilters.selectedCategories,
          }),
          ...(debouncedFilters.selectedSubcategories.length > 0 && {
            subcategories: debouncedFilters.selectedSubcategories,
          }),
          ...(debouncedFilters.selectedSources.length > 0 && {
            sources: debouncedFilters.selectedSources,
          }),
          ...(debouncedFilters.keywords.length > 0 && { keywords: debouncedFilters.keywords }),
          timePeriod: debouncedFilters.timePeriod,
          sortBy: newSortBy,
          sortOrder: newSortOrder,
          hasEnrichment: true,
          useMlScoring: debouncedFilters.useMlScoring,
          limit,
          offset: newOffset,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getPapers: {
            ...fetchMoreResult.getPapers,
            papers: [...prev.getPapers.papers, ...fetchMoreResult.getPapers.papers],
          },
        };
      },
    });
    setOffset(newOffset);
  };

  if (!filtersInitialized || (loading && offset === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="error">
          <span className="font-semibold">Error loading feed</span>
          <p>{error.message}</p>
        </Alert>
      </div>
    );
  }

  const rawPapers = data?.getPapers.papers || [];
  const papers: TransformedWork[] = rawPapers.map(mapGraphQLPaperToWork);
  const totalCount = data?.getPapers.totalCount || 0;
  const hasMore = data?.getPapers.hasMore || false;

  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedSources.length +
    keywords.length;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {preferences?.firstName
            ? `Welcome to your feed, ${preferences.firstName}!`
            : 'Research Feed'}
        </h1>
        <p className="text-gray-600">
          {preferences?.completedAt &&
          new Date(preferences.completedAt).getTime() > Date.now() - 60000
            ? 'Your personalized feed is ready based on your interests.'
            : 'Discover the latest research papers from leading preprint servers'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          {/* Sort Dropdown */}
          <Dropdown
            trigger={
              <Button variant="default" className="flex items-center gap-2">
                {sortOptions.find((opt) => opt.value === sortBy)?.icon &&
                  React.createElement(sortOptions.find((opt) => opt.value === sortBy)!.icon, {
                    className: 'w-4 h-4',
                  })}
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            }
          >
            {sortOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? 'bg-gray-100' : ''}
              >
                <option.icon className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* Time Period Dropdown */}
          <Dropdown
            trigger={
              <Button variant="outlined" className="flex items-center gap-2 whitespace-nowrap">
                <Calendar className="w-4 h-4" />
                {timePeriodOptions.find((opt) => opt.value === timePeriod)?.label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            }
          >
            {timePeriodOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => setTimePeriod(option.value)}
                className={timePeriod === option.value ? 'bg-gray-100' : ''}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Customize Results Button */}
        <Button
          variant={showCustomize ? 'default' : 'outlined'}
          onClick={() => setShowCustomize(!showCustomize)}
          className="flex items-center gap-2"
        >
          <Settings className={`w-4 h-4 ${showCustomize ? 'animate-spin-slow' : ''}`} />
          Customize Results
          {activeFilterCount > 0 ? (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          ) : (
            <span className="ml-1 text-xs text-gray-500">(All)</span>
          )}
        </Button>
      </div>

      {/* Advanced Filter (shown when customize is active) */}
      {showCustomize && (
        <AdvancedFilter
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          selectedSources={selectedSources}
          keywords={keywords}
          timePeriod={timePeriod}
          sortBy={sortBy}
          useMlScoring={useMlScoring}
          onFilterChange={handleFilterChange}
          isUpdating={isFiltersUpdating}
        />
      )}

      <div className="mb-4 text-sm text-gray-600">
        <p>
          Showing {papers.length} of {totalCount.toLocaleString()} papers
        </p>
      </div>

      <div className="space-y-4">
        {papers.map((paper, index) => (
          <PaperCard
            key={`${paper.doi || paper.id}-${index}`}
            paper={paper}
            graphqlData={rawPapers[index]}
            onCategoryClick={handleCategoryClick}
            onSubcategoryClick={handleSubcategoryClick}
            onSourceClick={handleSourceClick}
          />
        ))}
      </div>

      {papers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No papers found</h3>
              <p className="text-gray-600 mb-4">
                {activeFilterCount > 0
                  ? 'No papers match your current filters. Try adjusting your search criteria.'
                  : 'No papers are available at this time. Please check back later.'}
              </p>
            </div>
            {activeFilterCount > 0 && (
              <Button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSubcategories([]);
                  setSelectedSources([]);
                  setKeywords([]);
                  setTimePeriod('LAST_WEEK');
                  setSortBy('best');
                  setUseMlScoring(false);
                  setOffset(0);
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={loadMore} disabled={loading} className="group">
            {loading ? (
              <>
                <Loader size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                Load More Papers
                <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <ApolloProvider>
      <PageLayout>
        <FeedContent />
      </PageLayout>
    </ApolloProvider>
  );
}
