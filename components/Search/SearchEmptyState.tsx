'use client';

import { Search as SearchIcon } from 'lucide-react';
import { SearchFilters } from '@/types/search';

interface SearchEmptyStateProps {
  readonly onSearch: (query: string) => void;
  readonly query?: string;
  readonly filters?: SearchFilters;
  readonly hasFilters?: boolean;
  readonly onClearFilters?: () => void;
}

export function SearchEmptyState({
  onSearch,
  query,
  filters,
  hasFilters = false,
  onClearFilters,
}: SearchEmptyStateProps) {
  // Show "no results" state if there's a query but no results
  if (query?.trim()) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            We could not find any matches for "{query}"
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
          <SearchIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search</h2>
        <p className="text-base text-gray-600 max-w-xl mx-auto">
          Use the search bar in the header to start searching.
        </p>
      </div>
    </div>
  );
}
