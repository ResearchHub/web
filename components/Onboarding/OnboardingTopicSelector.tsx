'use client';

import { Topic } from '@/types/topic';
import { TopicSearch } from '@/components/Search/TopicSearch';
import { SearchSuggestion } from '@/types/search';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/utils/styles';
import { Hash, Check } from 'lucide-react';
import { toTitleCase } from '@/utils/stringUtils';
import { getTopicEmoji } from '@/components/Topic/TopicEmojis';
import { TopicListSkeleton } from '@/components/skeletons/TopicListSkeleton';

interface OnboardingTopicSelectorProps {
  topics: Topic[];
  selectedTopicIds: number[];
  onTopicToggle: (topicId: number) => void;
  className?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function OnboardingTopicSelector({
  topics,
  selectedTopicIds,
  onTopicToggle,
  className = '',
  headerTitle,
  headerSubtitle,
}: OnboardingTopicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect to detect scroll on parent container
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;

      console.log('scrollTop:', scrollTop); // Debug log
      setIsScrolling(scrollTop > 45);
    };

    // Find the scrollable parent (the one with overflow-y-auto)
    const findScrollParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;

      const style = window.getComputedStyle(element);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        console.log('Found scrollable parent:', element); // Debug log
        return element;
      }

      return findScrollParent(element.parentElement);
    };

    // Use the ref to find the scrollable parent
    if (containerRef.current) {
      const scrollableParent = findScrollParent(containerRef.current.parentElement);
      if (scrollableParent) {
        scrollableParent.addEventListener('scroll', handleScroll);
        return () => scrollableParent.removeEventListener('scroll', handleScroll);
      }
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
    } else {
      setHasSearched(false);
    }
  }, []);

  const handleSearchResults = useCallback((results: SearchSuggestion[]) => {
    setSearchResults(results);
  }, []);

  const handleSearching = useCallback((searching: boolean) => {
    setIsSearching(searching);
    if (!searching) {
      setHasSearched(true);
    }
  }, []);

  // Filter or use search results
  const displayTopics = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults.map(
        (result) =>
          ({
            id: result.id || 0,
            name: result.displayName || '',
            slug: 'slug' in result && result.slug ? result.slug : `${result.id}`,
            description: 'description' in result ? result.description : undefined,
          }) as Topic
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return topics.filter(
        (topic) =>
          topic.name.toLowerCase().includes(query) ||
          (topic.description && topic.description.toLowerCase().includes(query))
      );
    }

    return topics;
  }, [topics, searchQuery, searchResults]);

  // Show skeleton while searching, when we have a query but haven't searched yet, or when topics are still loading
  const showSkeleton = isSearching || (searchQuery && !hasSearched) || topics.length === 0;
  return (
    <div ref={containerRef} className={className}>
      <div
        className={cn(
          'top-0 bg-white z-10 pb-4 mb-2 transition-all duration-200',
          isScrolling ? 'absolute left-0 right-0' : 'sticky',
          isScrolling && 'shadow-md px-4 pt-3'
        )}
      >
        {/* Header - only shown when scrolling */}
        {isScrolling && (
          <div className="mb-3">
            <h2 className="text-md font-medium text-gray-900 text-left">Feed Setup</h2>
          </div>
        )}

        <div className={cn(isScrolling ? 'w-full' : 'px-1 pt-1')}>
          <TopicSearch
            placeholder="Search topics"
            onSearch={handleSearch}
            onSearchResults={handleSearchResults}
            onSearching={handleSearching}
            className="w-full"
          />
        </div>
      </div>

      <div className="pb-4 max-w-7xl mx-auto">
        {showSkeleton ? (
          <TopicListSkeleton variant="compact" count={12} />
        ) : displayTopics.length === 0 && topics.length > 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? `No topics found matching "${searchQuery}"` : 'No topics available'}
          </div>
        ) : displayTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTopics.map((topic) => {
              const topicTitle = toTitleCase(topic.name);
              const isSelected = selectedTopicIds.includes(topic.id);
              const displayIcon = getTopicEmoji(topic.name) || getTopicEmoji(topic.slug);

              return (
                <button
                  key={topic.id}
                  onClick={() => onTopicToggle(topic.id)}
                  className={cn(
                    'group bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden w-full text-left relative p-4',
                    'flex items-center gap-3 min-h-[64px]',
                    'max-[480px]:flex-col max-[480px]:gap-2 max-[480px]:h-auto max-[480px]:items-start max-[480px]:py-3',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {displayIcon ? (
                      <span className="text-2xl">{displayIcon}</span>
                    ) : (
                      <Hash
                        className={cn('w-6 h-6', isSelected ? 'text-blue-600' : 'text-gray-400')}
                      />
                    )}
                  </div>

                  <h3
                    className={cn(
                      'font-medium text-sm flex-1 break-words line-clamp-2',
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    )}
                  >
                    {topicTitle}
                  </h3>

                  {isSelected && (
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 max-[480px]:top-2 max-[480px]:translate-y-0">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
