'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchSortControls } from '@/components/Search/SearchSortControls';
import { SearchEmptyState } from '@/components/Search/SearchEmptyState';
import { useSearch } from '@/hooks/useSearch';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Search as SearchIcon } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { getFeedKey } from '@/contexts/NavigationContext';

interface SearchPageContentProps {
  readonly searchParams: {
    readonly q?: string;
    readonly tab?: string;
    readonly sort?: string;
    readonly page?: string;
    readonly [key: string]: string | undefined;
  };
}

export function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.q || '');
  const [hasSearched, setHasSearched] = useState(false);

  const {
    entries,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    stagedFilters,
    sortBy,
    setSortBy,
    search,
  } = useSearch({ pageSize: 40 });

  // Initialize from URL params and perform initial search
  useEffect(() => {
    // Perform initial search only when component mounts or URL query changes
    if (searchParams.q?.trim()) {
      setQuery(searchParams.q);
      setHasSearched(true);
      search(searchParams.q, 'documents');

      // Scroll to top when query changes (e.g., from shift+enter in modal)
      // Use double requestAnimationFrame to ensure DOM is ready after navigation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Try to find the scroll container used by PageLayout
          // The scroll container has overflow-y-auto and flex-1 classes
          const scrollContainer = document.querySelector(
            '.flex-1.flex.flex-col.overflow-y-auto'
          ) as HTMLElement;
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            // Fallback to window scroll
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });
    }
  }, [searchParams.q]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    // Trigger the actual search
    if (searchQuery.trim()) {
      setHasSearched(true);
      search(searchQuery, 'documents');
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

  const sortControls = query.trim() && (
    <div className="flex justify-end">
      <SearchSortControls sortBy={sortBy} onSortChange={setSortBy} activeTab="documents" />
    </div>
  );

  // Generate search-specific feed key (include query parameter)
  const searchFeedKey = useMemo(() => {
    if (!query.trim()) return undefined;
    return getFeedKey({
      pathname: '/search',
      queryParams: { q: query },
    });
  }, [query]);

  // Show a blank page (no default search UI) if no query
  if (!query.trim()) {
    return (
      <PageLayout
        rightSidebar={true}
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
        rightSidebar={true}
        className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
      >
        {header}
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error ?? 'Something went wrong while fetching results. Please try again.'}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Empty state is now handled by FeedContent's noEntriesElement prop

  return (
    <PageLayout
      rightSidebar={true}
      className="tablet:!max-w-full content-md:!max-w-full content-lg:!max-w-full content-xl:!max-w-full"
    >
      {header}

      <div className="max-w-4xl mx-auto">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {sortControls && <div className="mb-4">{sortControls}</div>}

            {/* Use FeedContent for consistent rendering and infinite scroll */}
            {hasSearched && (
              <FeedContent
                entries={entries}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                loadMore={loadMore}
                feedKey={searchFeedKey}
                showGrantHeaders={true}
                showReadMoreCTA={true}
                hideActions={true}
                noEntriesElement={
                  <SearchEmptyState
                    onSearch={handleSearch}
                    query={query}
                    filters={stagedFilters}
                    hasFilters={false}
                    onClearFilters={() => {}}
                  />
                }
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
