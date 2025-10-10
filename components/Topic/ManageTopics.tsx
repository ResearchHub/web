'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Topic } from '@/types/topic';
import { BrowsePageHeader } from '@/app/browse/components/BrowsePageHeader';
import { useFollowContext } from '@/contexts/FollowContext';
import { SearchSuggestion } from '@/types/search';
import { TopicList } from './TopicList';
import { TopicListSkeleton } from '@/components/skeletons/TopicListSkeleton';
import { TopicSearch } from '@/components/Search/TopicSearch';

interface ManageTopicsProps {
  initialTopics?: Topic[];
  showFollowingTab?: boolean;
  defaultTab?: 'all' | 'following';
  className?: string;
  topicListVariant?: 'default' | 'compact';
}

export function ManageTopics({
  initialTopics = [],
  showFollowingTab = true,
  defaultTab = 'all',
  className = '',
  topicListVariant = 'default',
}: ManageTopicsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'following'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { followedTopics, followedTopicObjects, getFollowedTopicObjects } = useFollowContext();

  useEffect(() => {
    const shouldFetchFollowedTopics = activeTab === 'following' && showFollowingTab;
    if (shouldFetchFollowedTopics) {
      getFollowedTopicObjects();
    }
  }, [activeTab, getFollowedTopicObjects, showFollowingTab]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
    } else {
      // Reset hasSearched when starting a new search
      setHasSearched(false);
    }
  }, []);

  const handleSearchResults = useCallback(
    (results: SearchSuggestion[]) => {
      const isAllTab = activeTab === 'all';
      if (isAllTab) {
        setSearchResults(results);
      }
    },
    [activeTab]
  );

  const handleSearching = useCallback(
    (searching: boolean) => {
      const isAllTab = activeTab === 'all';
      if (isAllTab) {
        setIsSearching(searching);
        if (!searching) {
          // Mark that we've completed a search
          setHasSearched(true);
        }
      }
    },
    [activeTab]
  );

  const handleTabChange = (tab: 'all' | 'following') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false);
  };

  // Sort followed topics by createdDate (most recent first)
  const sortedFollowedTopics = useMemo(() => {
    return [...followedTopicObjects]
      .sort((a, b) => {
        // Sort by createdDate in descending order (most recent first)
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      })
      .map((obj) => obj.data as Topic);
  }, [followedTopicObjects]);

  const getDisplayTopics = () => {
    const isFollowingTab = activeTab === 'following';
    const hasSearchQuery = Boolean(searchQuery);

    if (isFollowingTab) {
      if (hasSearchQuery) {
        const query = searchQuery.toLowerCase();
        return sortedFollowedTopics.filter(
          (topic) =>
            topic.name.toLowerCase().includes(query) ||
            (topic.description && topic.description.toLowerCase().includes(query))
        );
      }
      return sortedFollowedTopics;
    }

    return null;
  };

  const displayTopics = getDisplayTopics();

  // View state booleans
  const isAllTab = activeTab === 'all';
  const hasSearchQuery = Boolean(searchQuery);
  const isSearchingTopics = isSearching || (hasSearchQuery && !hasSearched);
  const hasNoSearchResults = hasSearched && searchResults.length === 0 && hasSearchQuery;
  const hasSearchResults = searchResults.length > 0 && hasSearchQuery;
  const showAllTopics = !hasSearchQuery && isAllTab;
  const hasFollowedTopics = displayTopics && displayTopics.length > 0;
  const showFollowedSearchCount = hasSearchQuery && hasFollowedTopics && !isSearching;
  const noFollowedTopicsMessage = hasSearchQuery
    ? `No followed topics found matching "${searchQuery}"`
    : 'You are not following any topics yet';

  return (
    <div className={className}>
      {showFollowingTab ? (
        <BrowsePageHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSearch={handleSearch}
          onSearchResults={handleSearchResults}
          onSearching={handleSearching}
          followingCount={followedTopics.length}
        />
      ) : (
        <div className="mb-6 mt-1 px-1">
          <TopicSearch
            placeholder="Search topics"
            onSearch={handleSearch}
            onSearchResults={handleSearchResults}
            onSearching={handleSearching}
            className="w-full"
          />
        </div>
      )}

      <div className="py-4 max-w-7xl mx-auto">
        {isAllTab ? (
          <>
            {hasSearchQuery && (
              <>
                {isSearchingTopics && <TopicListSkeleton />}

                {hasNoSearchResults && (
                  <div className="text-center py-8 text-gray-500">
                    No topics found matching "{searchQuery}"
                  </div>
                )}

                {hasSearchResults && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-700">
                        {searchResults.length} topic{searchResults.length !== 1 ? 's' : ''} found
                      </h3>
                    </div>

                    <TopicList
                      topics={searchResults.map(
                        (result) =>
                          ({
                            id: result.id || 0,
                            name: result.displayName || '',
                            slug: 'slug' in result && result.slug ? result.slug : `${result.id}`,
                            description: 'description' in result ? result.description : undefined,
                          }) as Topic
                      )}
                      variant={topicListVariant}
                    />
                  </>
                )}
              </>
            )}

            {showAllTopics && <TopicList topics={initialTopics} variant={topicListVariant} />}
          </>
        ) : (
          <>
            {hasFollowedTopics ? (
              <>
                {showFollowedSearchCount && (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-700">
                      {displayTopics.length} topic{displayTopics.length !== 1 ? 's' : ''} found
                    </h3>
                  </div>
                )}
                <TopicList topics={displayTopics} variant={topicListVariant} />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">{noFollowedTopicsMessage}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
