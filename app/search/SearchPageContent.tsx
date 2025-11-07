'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchResult } from '@/components/Search/SearchResult';
import { SearchSortControls } from '@/components/Search/SearchSortControls';
import { SearchEmptyState } from '@/components/Search/SearchEmptyState';
import { useSearch } from '@/hooks/useSearch';
import { Tabs } from '@/components/ui/Tabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Search as SearchIcon } from 'lucide-react';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/utils/styles';

export type SearchTab = 'documents';

interface SearchPageContentProps {
  searchParams: {
    q?: string;
    tab?: string;
    sort?: string;
    page?: string;
    [key: string]: string | undefined;
  };
}

export function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SearchTab>('documents');
  const [query, setQuery] = useState(searchParams.q || '');

  const {
    entries,
    people,
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
  } = useSearch();

  // Initialize from URL params and perform initial search
  useEffect(() => {
    const tab = searchParams.tab as SearchTab;
    if (tab && tab === 'documents') {
      setActiveTab(tab);
    }

    // Perform initial search only when component mounts or URL query changes
    if (searchParams.q?.trim()) {
      setQuery(searchParams.q);
      search(searchParams.q, 'documents');
    }
  }, [searchParams.q, searchParams.tab]);

  const handleTabChange = (tabId: string) => {
    const tab = tabId as SearchTab;
    setActiveTab(tab);

    // Update URL
    const newParams = new URLSearchParams(urlSearchParams);
    newParams.set('tab', tab);
    router.push(`/search?${newParams.toString()}`);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    // Trigger the actual search
    if (searchQuery.trim()) {
      search(searchQuery, activeTab);
    }

    // Update URL
    const newParams = new URLSearchParams(urlSearchParams);
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery);
    } else {
      newParams.delete('q');
    }
    router.push(`/search?${newParams.toString()}`);
  };

  const tabs = [
    {
      id: 'documents',
      label: 'Documents',
      badge: entries.length > 0 ? entries.length : undefined,
    },
  ];

  const header = (
    <div className="space-y-4 mb-8">
      {/* Title only; users will use the header search bar */}
      <MainPageHeader
        icon={<SearchIcon className="w-6 h-6 text-primary-500" />}
        title="Search"
        subtitle="Find papers, grants, authors, and peer reviews"
      />
    </div>
  );

  // Hide tabs when there's only one tab (Documents)
  const feedTabs =
    tabs.length > 1 ? (
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} variant="primary" />
    ) : null;

  const sortControls = query.trim() && (
    <div className="flex justify-end pr-0">
      <SearchSortControls sortBy={sortBy} onSortChange={setSortBy} activeTab={activeTab} />
    </div>
  );

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (!inView || !hasMore || isLoading) return;

    // Small delay to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      loadMore();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [inView, hasMore, isLoading, loadMore]);

  // Show a blank page (no default search UI) if no query
  if (!query.trim()) {
    return (
      <PageLayout
        rightSidebar={false}
        className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
      >
        {header}
      </PageLayout>
    );
  }

  // Show error state if API failed
  if (!isLoading && error && query.trim()) {
    return (
      <PageLayout
        rightSidebar={false}
        className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
      >
        {header}
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error || 'Something went wrong while fetching results. Please try again.'}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show empty state with no results
  if (!isLoading && !error && entries.length === 0 && query.trim()) {
    return (
      <PageLayout
        rightSidebar={false}
        className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
      >
        {header}
        <div className="max-w-7xl mx-auto">
          <SearchEmptyState
            onSearch={handleSearch}
            query={query}
            filters={stagedFilters}
            hasFilters={false}
            onClearFilters={() => {}}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      rightSidebar={false}
      className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
    >
      {header}

      <div className="max-w-7xl mx-auto">
        {feedTabs}

        <div className={cn('flex gap-6', feedTabs ? 'mt-6' : '')}>
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {sortControls && <div className="mb-4">{sortControls}</div>}

            {/* Show skeletons while loading initial results */}
            {isLoading && entries.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <FeedItemSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : (
              <>
                {/* Render search results */}
                <div className="space-y-6">
                  {entries.map((searchResult, index) => (
                    <SearchResult
                      key={searchResult.entry.id}
                      searchResult={searchResult}
                      index={index}
                      showGrantHeaders={true}
                      showReadMoreCTA={true}
                    />
                  ))}
                </div>

                {/* Load more trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="mt-6">
                    {isLoading && (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <FeedItemSkeleton key={`loading-${i}`} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
