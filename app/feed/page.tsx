'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAPERS, PaperSearchResponse } from '@/lib/graphql/queries';
import { mapGraphQLPaperToWork } from '@/lib/graphql/mappers';
import { TransformedWork } from '@/types/work';
import { transformPaperSearchResponse } from '@/types/paper';
import { useFeedFilters } from '@/hooks/useFeedFilters';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { AdvancedFilter } from '@/components/Feed/AdvancedFilter';
import { PaperCard } from '@/components/Feed/PaperCard';
import { FeedControls } from '@/components/Feed/FeedControls';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Search } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { usePreferences } from '@/contexts/PreferencesContext';

function FeedContent() {
  const { preferences } = usePreferences();
  const {
    filters,
    debouncedFilters,
    updateFilters,
    clearFilters,
    isUpdating,
    activeFilterCount,
    filtersInitialized,
  } = useFeedFilters();

  const [showCustomize, setShowCustomize] = useState(false);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

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
        ...(debouncedFilters.keywords.length > 0 && { keywords: debouncedFilters.keywords }),
        ...(debouncedFilters.selectedSubcategories.length > 0 && {
          subcategories: debouncedFilters.selectedSubcategories,
        }),
        timePeriod: debouncedFilters.timePeriod,
        sortBy: graphqlSortBy,
        limit,
        useMlRelevance: debouncedFilters.useMlScoring,
        // Legacy fields that might still be needed
        ...(debouncedFilters.selectedCategories.length > 0 && {
          categories: debouncedFilters.selectedCategories,
        }),
        ...(debouncedFilters.selectedSources.length > 0 && {
          sources: debouncedFilters.selectedSources,
        }),
        sortOrder,
        hasEnrichment: true,
        offset,
      },
    },
  });

  const handleCategoryClick = (categorySlug: string) => {
    if (!filters.selectedCategories.includes(categorySlug)) {
      updateFilters({ selectedCategories: [...filters.selectedCategories, categorySlug] });
      setOffset(0);
    }
  };

  const handleSubcategoryClick = (subcategorySlug: string) => {
    if (!filters.selectedSubcategories.includes(subcategorySlug)) {
      updateFilters({ selectedSubcategories: [...filters.selectedSubcategories, subcategorySlug] });
      setOffset(0);
    }
  };

  const handleSourceClick = (source: string) => {
    if (!filters.selectedSources.includes(source)) {
      updateFilters({ selectedSources: [...filters.selectedSources, source] });
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
          ...(debouncedFilters.keywords.length > 0 && { keywords: debouncedFilters.keywords }),
          ...(debouncedFilters.selectedSubcategories.length > 0 && {
            subcategories: debouncedFilters.selectedSubcategories,
          }),
          timePeriod: debouncedFilters.timePeriod,
          sortBy: newSortBy,
          limit,
          useMlRelevance: debouncedFilters.useMlScoring,
          // Legacy fields that might still be needed
          ...(debouncedFilters.selectedCategories.length > 0 && {
            categories: debouncedFilters.selectedCategories,
          }),
          ...(debouncedFilters.selectedSources.length > 0 && {
            sources: debouncedFilters.selectedSources,
          }),
          sortOrder: newSortOrder,
          hasEnrichment: true,
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

  // Transform the response data
  const transformedResponse = data?.getPapers ? transformPaperSearchResponse(data.getPapers) : null;
  const rawPapers = data?.getPapers.papers || [];
  const papers: TransformedWork[] = rawPapers.map(mapGraphQLPaperToWork);
  const totalCount = transformedResponse?.totalCount || 0;
  const hasMore = transformedResponse?.hasMore || false;

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

      {/* Filter Controls */}
      <FeedControls
        sortBy={filters.sortBy}
        timePeriod={filters.timePeriod}
        showCustomize={showCustomize}
        activeFilterCount={activeFilterCount}
        onSortChange={(sort) => {
          updateFilters({ sortBy: sort });
          setOffset(0);
        }}
        onTimePeriodChange={(period) => {
          updateFilters({ timePeriod: period });
          setOffset(0);
        }}
        onToggleCustomize={() => setShowCustomize(!showCustomize)}
      />

      {/* Advanced Filter (shown when customize is active) */}
      {showCustomize && (
        <AdvancedFilter
          selectedCategories={filters.selectedCategories}
          selectedSubcategories={filters.selectedSubcategories}
          selectedSources={filters.selectedSources}
          keywords={filters.keywords}
          timePeriod={filters.timePeriod}
          sortBy={filters.sortBy}
          useMlScoring={filters.useMlScoring}
          onFilterChange={(newFilters) => {
            // Map the property names from AdvancedFilter to match the filter state
            updateFilters({
              selectedCategories: newFilters.categories,
              selectedSubcategories: newFilters.subcategories,
              selectedSources: newFilters.sources,
              keywords: newFilters.keywords,
              timePeriod: newFilters.timePeriod,
              sortBy: newFilters.sortBy,
              useMlScoring: newFilters.useMlScoring,
            });
            setOffset(0);
          }}
          isUpdating={isUpdating}
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
                  clearFilters();
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
