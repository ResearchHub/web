'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestion } from '@/types/search';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasPrefetchedRef = useRef(false);
  const navigatingToSearchRef = useRef(false);

  const prefetchSearchRoute = () => {
    if (!hasPrefetchedRef.current) {
      try {
        router.prefetch('/search');
        hasPrefetchedRef.current = true;
      } catch {}
    }
  };

  // Get search suggestions
  const { loading, suggestions } = useSearchSuggestions({
    query,
    includeLocalSuggestions: true,
  });

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      prefetchSearchRoute();
    }
  }, [isOpen]);

  // Handle suggestion selection
  const handleSelect = (suggestion: SearchSuggestion) => {
    try {
      onClose(); // Close modal first

      // Navigate based on suggestion type
      if (suggestion.entityType === 'paper') {
        if (suggestion.isRecent && suggestion.contentType && suggestion.contentType !== 'paper') {
          if (suggestion.id) {
            router.push(`/post/${suggestion.id}`);
          } else {
            router.push('/');
          }
        } else if (suggestion.id) {
          router.push(`/paper/${suggestion.id}/${suggestion.slug || ''}`);
        } else if ('doi' in suggestion && suggestion.doi) {
          router.push(`/paper?doi=${encodeURIComponent(suggestion.doi)}`);
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
      }
    } catch (error) {
      console.error('Error handling search suggestion selection:', error);
      router.push('/');
    }
  };

  // Reset query when modal closes (but preserve if navigating to search page)
  useEffect(() => {
    if (!isOpen) {
      if (!navigatingToSearchRef.current) {
        setQuery('');
      }
      navigatingToSearchRef.current = false;
    }
  }, [isOpen]);

  // Restore query from URL when modal opens on search page
  useEffect(() => {
    if (isOpen) {
      if (pathname === '/search') {
        const urlQuery = searchParams.get('q');
        if (urlQuery) {
          setQuery(urlQuery);
        } else {
          setQuery('');
        }
      } else if (!navigatingToSearchRef.current) {
        setQuery('');
      }
    }
  }, [isOpen, pathname, searchParams]);

  // Detect OS for keyboard shortcut display
  const isMac = typeof window !== 'undefined' && navigator.userAgent.toUpperCase().includes('MAC');
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  const headerAction = (
    <div className="flex items-center">
      {/* Back arrow - mobile only */}
      <div className="md:!hidden -ml-2">
        <Button onClick={onClose} variant="ghost" size="icon" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      <SearchIcon className="h-5 w-5 text-gray-600" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Search"
      maxWidth="max-w-2xl"
      padding="p-0"
      headerAction={headerAction}
      initialFocus={inputRef}
      showCloseButton={true}
      className="md:!w-[600px] md:!min-h-[500px]"
    >
      {/* Search Input */}
      <div className="border-b border-gray-200 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search papers, topics, authors..."
            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-8 md:!pr-24 text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => {
              (e.target as HTMLInputElement).select();
            }}
            onFocus={() => {
              setIsFocused(true);
              prefetchSearchRoute();
              inputRef.current?.select();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                e.preventDefault();
                navigatingToSearchRef.current = true;
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                onClose();
              }
            }}
          />
          {/* Keyboard shortcut hint - desktop only */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:!flex items-center space-x-1 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              {shortcutKey}
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              K
            </kbd>
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 md:!right-20 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto md:!max-h-96 md:!min-h-[300px] md:!flex-none">
        {query.trim() || suggestions.length > 0 ? (
          <SearchSuggestions
            query={query}
            isFocused={isFocused}
            onSelect={handleSelect}
            displayMode="inline"
            showSuggestionsOnFocus={true}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <SearchIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">Search ResearchHub</p>
            <p className="text-sm">Find papers, topics, authors, and more</p>
          </div>
        )}
      </div>

      {/* Show All Results Button - appears when user has typed a search query */}
      {query.trim().length >= 2 && !loading && (
        <div className="border-t border-gray-200 py-4 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-center text-primary-700 hover:text-primary-900 hover:bg-gray-100"
            onClick={() => {
              navigatingToSearchRef.current = true;
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              onClose();
            }}
          >
            <span>Show all results</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </BaseModal>
  );
}
