'use client';

import { useState } from 'react';
import { Search } from '@/components/Search/Search';
import { Button } from '@/components/ui/Button';
import {
  Search as SearchIcon,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { SearchFilters } from '@/types/search';

interface SearchEmptyStateProps {
  onSearch: (query: string) => void;
  query?: string;
  filters?: SearchFilters;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function SearchEmptyState({
  onSearch,
  query,
  filters,
  hasFilters = false,
  onClearFilters,
}: SearchEmptyStateProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleSearches = [
    {
      query: 'machine learning',
      description: 'Find papers on machine learning',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      query: 'neuroscience',
      description: 'Explore neuroscience research',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      query: 'climate change',
      description: 'Discover climate research',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      query: 'cancer research',
      description: 'Find cancer studies',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  // Show "no results" state if there's a query but no results
  if (query && query.trim()) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No results for "{query}"</h2>
          <p className="text-lg text-gray-600 mb-6">
            We couldn't find any matches. Try the suggestions below:
          </p>
        </div>

        {/* Suggestions */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Try these suggestions:</h3>
            <ul className="space-y-3">
              {hasFilters && onClearFilters && (
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <button
                      onClick={onClearFilters}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Remove active filters
                    </button>
                    <p className="text-sm text-gray-600">
                      Your current filters may be too restrictive
                    </p>
                  </div>
                </li>
              )}
              {filters?.yearMin !== undefined || filters?.yearMax !== undefined ? (
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="text-gray-700 font-medium">Broaden the date range</span>
                    <p className="text-sm text-gray-600">Try searching across more years</p>
                  </div>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-gray-700 font-medium">Check your spelling</span>
                  <p className="text-sm text-gray-600">Make sure all words are spelled correctly</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-gray-700 font-medium">Use different keywords</span>
                  <p className="text-sm text-gray-600">Try more general or alternative terms</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Example searches */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Or try these popular searches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {exampleSearches.map((example, index) => (
              <button
                key={index}
                onClick={() => onSearch(example.query)}
                className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary-600 group-hover:text-primary-700">
                    {example.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-primary-900">
                      {example.query}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-primary-700">
                      {example.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      {/* Search illustration */}
      <div className="mb-8">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
          <SearchIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Search ResearchHub</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Find papers, grants, authors, and peer reviews. Use our advanced filters to discover
          exactly what you're looking for.
        </p>
      </div>

      {/* What you can search */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">What you can search</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Papers</h4>
            <p className="text-sm text-gray-600">Research papers and preprints</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Award className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Grants</h4>
            <p className="text-sm text-gray-600">Funding opportunities</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Authors</h4>
            <p className="text-sm text-gray-600">Researchers and scientists</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Peer Reviews</h4>
            <p className="text-sm text-gray-600">Expert reviews and feedback</p>
          </div>
        </div>
      </div>

      {/* Example searches */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Try these searches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {exampleSearches.map((example, index) => (
            <button
              key={index}
              onClick={() => onSearch(example.query)}
              className="p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary-600 group-hover:text-primary-700">{example.icon}</div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-primary-900">
                    {example.query}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-primary-700">
                    {example.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced search features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            Filter by year, citations, and content type
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            Sort by relevance, date, or popularity
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            Highlighted search terms in results
          </div>
        </div>
      </div>
    </div>
  );
}
