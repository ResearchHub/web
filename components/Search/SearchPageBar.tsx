'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { cn } from '@/utils/styles';
import { SearchSuggestion } from '@/types/search';
import type { EntityType } from '@/types/search';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface SearchPageBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchPageBar({
  initialQuery = '',
  onSearch,
  className,
  placeholder = 'Search papers, grants, authors...',
}: SearchPageBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused]);

  const handleSubmit = () => {
    if (query.trim()) {
      setIsFocused(false);
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    try {
      // Close the dropdown
      setIsFocused(false);

      // Navigate to the selected item
      if (suggestion.entityType === 'paper') {
        // Check if this is a funding request
        if (suggestion.contentType === 'preregistration') {
          router.push(`/fund/${suggestion.id}/${suggestion.slug || ''}`);
        } else if (suggestion.isRecent) {
          router.push(`/paper/${suggestion.id}/${suggestion.slug}`);
        } else {
          if (suggestion.id) {
            router.push(`/paper/${suggestion.id}/${suggestion.slug || ''}`);
          } else if ('doi' in suggestion && suggestion.doi) {
            router.push(`/paper?doi=${encodeURIComponent(suggestion.doi)}`);
          } else {
            router.push('/');
          }
        }
      } else if (suggestion.entityType === 'user' || suggestion.entityType === 'author') {
        navigateToAuthorProfile(suggestion.authorProfile.id);
      } else if (suggestion.entityType === 'hub') {
        if ('slug' in suggestion && suggestion.slug) {
          router.push(`/topic/${suggestion.slug}`);
        } else {
          router.push(`/topic/${suggestion.id}`);
        }
      } else if (suggestion.entityType === 'post') {
        router.push(`/post/${suggestion.id}`);
      } else {
        if (suggestion.url) {
          router.push(suggestion.url);
        } else {
          console.warn('Unable to navigate: missing URL', suggestion);
        }
      }
    } catch (error) {
      console.error('Error handling search suggestion selection:', error);
      router.push('/');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown - only shows while typing, doesn't trigger full search */}
      <SearchSuggestions
        query={query}
        isFocused={isFocused}
        onSelect={handleSelect}
        displayMode="dropdown"
        showSuggestionsOnFocus={false}
        indices={['paper', 'user', 'hub', 'post']}
      />
    </div>
  );
}
