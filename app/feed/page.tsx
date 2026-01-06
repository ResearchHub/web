'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, NetworkStatus } from '@apollo/client';
import { GET_PAPERS, PaperSearchResponse } from '@/lib/graphql/queries';
import { mapGraphQLPaperToWork } from '@/lib/graphql/mappers';
import { TransformedWork } from '@/types/work';
import { transformPaperSearchResponse } from '@/types/paper';
import { useFeedFilters } from '@/hooks/useFeedFilters';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { AdvancedFilter } from '@/components/Feed/AdvancedFilter';
import { FeedItemPaperV2 } from '@/components/Feed/items/FeedItemPaperV2';
import { FeedControls } from '@/components/Feed/FeedControls';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Search } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { usePreferences } from '@/contexts/PreferencesContext';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';

function FeedContent() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { preferences, clearPreferences } = usePreferences();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    tabs: feedTabsList,
    activeTab,
    handleTabChange,
  } = useFeedTabs(() => setIsNavigating(true));

  // Check if we should reset onboarding (for testing)
  useEffect(() => {
    if (searchParams.get('reset-onboarding') === 'true') {
      clearPreferences();
      // Also clear the feed filters to start fresh
      localStorage.removeItem('researchhub_feed_filters');
      // Remove the query parameter and reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('reset-onboarding');
      window.location.href = newUrl.toString();
    }
  }, [searchParams, clearPreferences]);

  // Check if user needs to see the new onboarding
  useEffect(() => {
    if (isUserLoading) return;

    // If user is logged in and hasn't completed the new onboarding
    if (user && !preferences?.completedAt) {
      router.replace('/onboarding');
    } else {
      // Only show the feed content if they don't need onboarding
      setCheckingOnboarding(false);
    }
  }, [user, isUserLoading, preferences, router]);

  // Set up intersection observer for infinite scrolling early to follow Rules of Hooks
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 20;

  const mapSortToGraphQL = (sort: string): { sortBy: string; sortOrder: string } => {
    switch (sort) {
      case 'best':
        return { sortBy: 'RELEVANCE', sortOrder: 'DESC' };
      case 'trending':
        return { sortBy: 'IMPACT_SCORE', sortOrder: 'DESC' };
      case 'trending-v2':
        return { sortBy: 'TRENDING', sortOrder: 'DESC' };
      case 'newest':
        return { sortBy: 'DATE', sortOrder: 'DESC' };
      default:
        return { sortBy: 'DATE', sortOrder: 'DESC' };
    }
  };

  const { sortBy: graphqlSortBy, sortOrder } = mapSortToGraphQL(debouncedFilters.sortBy);

  const { loading, error, data, fetchMore, networkStatus } = useQuery<{
    getPapers: PaperSearchResponse;
  }>(GET_PAPERS, {
    skip: !filtersInitialized,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
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
        ...(debouncedFilters.selectedSources.length > 0 &&
          debouncedFilters.selectedSources.length < 4 && {
            sources: debouncedFilters.selectedSources,
          }),
        sortOrder,
        hasEnrichment: debouncedFilters.hasEnrichment,
        offset: 0, // Always start at 0 for the initial query
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

  const loadMore = async () => {
    if (isLoadingMore) return; // Prevent duplicate calls

    console.log('Loading more papers, current offset:', offset, 'new offset:', offset + limit);
    setIsLoadingMore(true);
    const newOffset = offset + limit;
    const { sortBy: newSortBy, sortOrder: newSortOrder } = mapSortToGraphQL(
      debouncedFilters.sortBy
    );

    try {
      await fetchMore({
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
            ...(debouncedFilters.selectedSources.length > 0 &&
              debouncedFilters.selectedSources.length < 4 && {
                sources: debouncedFilters.selectedSources,
              }),
            sortOrder: newSortOrder,
            hasEnrichment: debouncedFilters.hasEnrichment,
            offset: newOffset,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          console.log('UpdateQuery - Previous papers:', prev.getPapers.papers.length);
          console.log('UpdateQuery - New papers:', fetchMoreResult.getPapers.papers.length);

          const result = {
            getPapers: {
              ...fetchMoreResult.getPapers,
              papers: [...prev.getPapers.papers, ...fetchMoreResult.getPapers.papers],
            },
          };

          console.log('UpdateQuery - Total papers after merge:', result.getPapers.papers.length);
          return result;
        },
      });

      setOffset(newOffset);
    } catch (error) {
      console.error('Error loading more papers:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Transform the response data (do this before conditional returns to use in useEffect)
  const transformedResponse = data?.getPapers ? transformPaperSearchResponse(data.getPapers) : null;
  const hasMore = transformedResponse?.hasMore || false;

  // Trigger load more when the sentinel element is in view (must be before conditional returns)
  useEffect(() => {
    if (inView && hasMore && !loading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loading, isLoadingMore]);

  // Only show initial loading state when it's the first load (no data yet)
  const isInitialLoading = loading && !data?.getPapers;

  // Show loading state while checking onboarding status
  if (checkingOnboarding || isUserLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!filtersInitialized) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Research Feed</h1>
            <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full uppercase">
              Beta
            </span>
          </div>
          <p className="text-gray-600">
            Discover the latest research papers from leading preprint servers
          </p>
        </div>

        {/* Show skeletons while initially loading */}
        <div className="space-y-6">
          {[...Array(8)].map((_, i) => (
            <FeedItemSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  // Get the rest of the transformed data
  const rawPapers = data?.getPapers.papers || [];
  const papers: TransformedWork[] = rawPapers.map(mapGraphQLPaperToWork);
  const totalCount = transformedResponse?.totalCount || 0;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">
            {preferences?.firstName
              ? `Welcome to your feed, ${preferences.firstName}!`
              : 'Research Feed'}
          </h1>
          <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full uppercase">
            Beta
          </span>
        </div>
        <p className="text-gray-600">
          {preferences?.completedAt &&
          new Date(preferences.completedAt).getTime() > Date.now() - 60000
            ? 'Your personalized feed is ready based on your interests.'
            : 'Discover the latest research papers from leading preprint servers'}
        </p>
      </div>

      <div className="mb-6 border-b">
        <FeedTabs
          activeTab={activeTab}
          tabs={feedTabsList}
          onTabChange={handleTabChange}
          isLoading={loading || isNavigating}
        />
      </div>

      {/* Filter Controls */}
      <FeedControls
        sortBy={filters.sortBy}
        timePeriod={filters.timePeriod}
        showCustomize={showCustomize}
        activeFilterCount={activeFilterCount}
        onSortChange={(sort: string) => {
          updateFilters({ sortBy: sort });
          setOffset(0);
        }}
        onTimePeriodChange={(period: string) => {
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
          hasEnrichment={filters.hasEnrichment}
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
              hasEnrichment: newFilters.hasEnrichment,
            });
            setOffset(0);
          }}
          isUpdating={isUpdating}
        />
      )}

      {/* Results Section with Loading States */}
      {error ? (
        <Alert variant="error" className="mt-4">
          <span className="font-semibold">Error loading papers</span>
          <p>{error.message}</p>
        </Alert>
      ) : isInitialLoading ? (
        <div className="space-y-12 mt-4">
          {[...Array(8)].map((_, i) => (
            <FeedItemSkeleton key={`initial-skeleton-${i}`} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            <p>
              Showing {papers.length} of {totalCount.toLocaleString()} papers
            </p>
          </div>

          <div className="space-y-12">
            {papers.map((paper, index) => (
              <FeedItemPaperV2
                key={`${paper.doi || paper.id}-${index}`}
                paper={paper}
                graphqlData={rawPapers[index]}
                onCategoryClick={handleCategoryClick}
                onSubcategoryClick={handleSubcategoryClick}
                onSourceClick={handleSourceClick}
              />
            ))}

            {/* Show skeletons when loading more */}
            {isLoadingMore && papers.length > 0 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <FeedItemSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            )}
          </div>

          {papers.length === 0 && !loading && !isLoadingMore && (
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

          {/* Infinite scroll sentinel */}
          {hasMore && !isLoadingMore && <div ref={loadMoreRef} className="h-10" />}
        </>
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
