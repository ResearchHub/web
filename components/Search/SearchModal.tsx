'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Command } from 'lucide-react';
import { SearchSuggestions } from './SearchSuggestions';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestion } from '@/types/search';
import { useRouter } from 'next/navigation';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const router = useRouter();

  // Get search suggestions
  const { loading, suggestions } = useSearchSuggestions({
    query,
    includeLocalSuggestions: true,
  });

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
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

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Detect OS for keyboard shortcut display
  const isMac =
    typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all overflow-hidden"
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
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.preventDefault();
                    // Navigate immediately for optimistic feedback
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    onClose();
                  }
                }}
              />
              {/* Keyboard shortcut hint */}
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
          <div className="max-h-96 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}
