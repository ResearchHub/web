'use client';

import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import { SearchService } from '@/services/search.service';
import { SearchSuggestion } from '@/types/search';

interface TopicSearchProps {
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchSuggestion[]) => void;
  onSearching?: (isSearching: boolean) => void;
  className?: string;
  placeholder?: string;
}

export function TopicSearch({
  onSearch,
  onSearchResults,
  onSearching,
  className,
  placeholder = 'Search topics...',
}: TopicSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle search with debouncing
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        try {
          setIsSearching(true);
          onSearching?.(true);
          // Search only in the 'hub' index for topics
          const results = await SearchService.getSuggestions(query, 'hub');
          setSearchResults(results);
          onSearchResults?.(results);
        } catch (error) {
          console.error('Error searching topics:', error);
          setSearchResults([]);
          onSearchResults?.([]);
        } finally {
          setIsSearching(false);
          onSearching?.(false);
        }
      } else {
        setSearchResults([]);
        onSearchResults?.([]);
      }
    };

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(performSearch, 300);

    // Notify parent of query change
    onSearch?.(query);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]); // Only re-run when query changes

  // Handle clicks outside
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

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    onSearchResults?.([]);
  };

  // Results are now handled by parent component

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white pl-12 pr-12 text-base focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search results are handled by parent component */}
    </div>
  );
}
