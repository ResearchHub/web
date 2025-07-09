'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apollo-client';
import { GET_PAPERS, PaperSearchResponse } from '@/lib/graphql/queries';
import { mapGraphQLPaperToWork } from '@/lib/graphql/mappers';
import { TransformedWork } from '@/types/work';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { AdvancedFilter } from '@/components/Feed/AdvancedFilter';
import { PaperCard } from '@/components/Feed/PaperCard';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown, TrendingUp, Quote, Clock, Calendar, Settings, Sparkles } from 'lucide-react';

function FeedContent() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>('LAST_WEEK');
  const [sortBy, setSortBy] = useState<string>('best');
  const [showCustomize, setShowCustomize] = useState(false);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

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

  const { sortBy: graphqlSortBy, sortOrder } = mapSortToGraphQL(sortBy);

  const { loading, error, data, fetchMore } = useQuery<{
    getPapers: PaperSearchResponse;
  }>(GET_PAPERS, {
    variables: {
      input: {
        ...(selectedCategories.length > 0 && { categories: selectedCategories }),
        ...(selectedSubcategories.length > 0 && { subcategories: selectedSubcategories }),
        ...(selectedSources.length > 0 && { sources: selectedSources }),
        ...(keywords.length > 0 && { keywords }),
        timePeriod,
        sortBy: graphqlSortBy,
        sortOrder,
        hasEnrichment: true,
        limit,
        offset,
      },
    },
  });

  const handleFilterChange = (filters: {
    categories: string[];
    subcategories: string[];
    sources: string[];
    keywords: string[];
    timePeriod: string;
    sortBy: string;
  }) => {
    setSelectedCategories(filters.categories);
    setSelectedSubcategories(filters.subcategories);
    setSelectedSources(filters.sources);
    setKeywords(filters.keywords);
    setTimePeriod(filters.timePeriod);
    setSortBy(filters.sortBy);
    setOffset(0); // Reset pagination when filters change
  };

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
    const { sortBy: newSortBy, sortOrder: newSortOrder } = mapSortToGraphQL(sortBy);

    fetchMore({
      variables: {
        input: {
          ...(selectedCategories.length > 0 && { categories: selectedCategories }),
          ...(selectedSubcategories.length > 0 && { subcategories: selectedSubcategories }),
          ...(selectedSources.length > 0 && { sources: selectedSources }),
          ...(keywords.length > 0 && { keywords }),
          timePeriod,
          sortBy: newSortBy,
          sortOrder: newSortOrder,
          hasEnrichment: true,
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

  if (loading && offset === 0) {
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Feed</h1>
        <p className="text-gray-600">
          Discover the latest research papers from leading preprint servers
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
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
          variant="outlined"
          onClick={() => setShowCustomize(!showCustomize)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Customize Results
          {selectedCategories.length +
            selectedSubcategories.length +
            selectedSources.length +
            keywords.length >
            0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCategories.length +
                selectedSubcategories.length +
                selectedSources.length +
                keywords.length}
            </span>
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
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="mb-4 text-sm text-gray-600">
        <p>
          Showing {papers.length} of {totalCount.toLocaleString()} papers
          {selectedCategories.length > 0 && ` in ${selectedCategories.length} categories`}
          {selectedSubcategories.length > 0 && ` and ${selectedSubcategories.length} subcategories`}
          {keywords.length > 0 && ` matching ${keywords.length} keywords`}
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
          <p className="text-gray-600 mb-4">No papers found matching your filters.</p>
          <Button
            onClick={() =>
              handleFilterChange({
                categories: [],
                subcategories: [],
                sources: [],
                keywords: [],
                timePeriod: 'LAST_WEEK',
                sortBy: 'best',
              })
            }
          >
            Clear Filters
          </Button>
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
    <ApolloProvider client={client}>
      <FeedContent />
    </ApolloProvider>
  );
}
