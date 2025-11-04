'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { cn } from '@/utils/styles';
import { SearchSuggestion } from '@/types/search';
import type { EntityType } from '@/types/search';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface SearchProps {
  onSelect?: (suggestion: SearchSuggestion) => void;
  displayMode?: 'dropdown' | 'inline';
  showSuggestionsOnFocus?: boolean;
  className?: string;
  placeholder?: string;
  indices?: EntityType[];
}

export function Search({
  onSelect,
  displayMode = 'dropdown',
  showSuggestionsOnFocus = true,
  className,
  placeholder = 'Search',
  indices,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !document.querySelector('.follow-topic-btn')?.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    // Only add the event listener if the dropdown is open
    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused]);

  const handleSelect = (suggestion: SearchSuggestion) => {
    try {
      // Close the dropdown
      setIsFocused(false);

      // If onSelect is provided, delegate selection handling and skip default behavior
      if (onSelect) {
        onSelect(suggestion);
        return;
      }

      // Default behavior
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
            // Fallback if no identifiers are available
            router.push('/');
          }
        }
      } else if (suggestion.entityType === 'user' || suggestion.entityType === 'author') {
        navigateToAuthorProfile(suggestion.authorProfile.id);
      } else if (suggestion.entityType === 'hub') {
        // Handle topic navigation
        if ('slug' in suggestion && suggestion.slug) {
          router.push(`/topic/${suggestion.slug}`);
        } else {
          router.push(`/topic/${suggestion.id}`);
        }
      } else if (suggestion.entityType === 'post') {
        router.push(`/post/${suggestion.id}`);
      } else {
        // Fallback for unknown types
        if (suggestion.url) {
          router.push(suggestion.url);
        } else {
          console.warn('Unable to navigate: missing URL and no fallback available', suggestion);
        }
      }
    } catch (error) {
      console.error('Error handling search suggestion selection:', error);
      // Fallback to home page or previous page
      router.push('/');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-10 text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              setIsFocused(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
          }}
          // No blur handler to prevent dropdown from closing too early
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

      <SearchSuggestions
        query={query}
        isFocused={isFocused}
        onSelect={handleSelect}
        displayMode={displayMode}
        showSuggestionsOnFocus={showSuggestionsOnFocus}
        indices={indices}
      />
    </div>
  );
}
