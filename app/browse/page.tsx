'use client';

import { useEffect, useState, useCallback } from 'react';
import { Topic, groupTopicsByCategory } from '@/types/topic';
import { HubService } from '@/services/hub.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { BrowsePageHeader } from './components/BrowsePageHeader';
import { useFollowContext } from '@/contexts/FollowContext';
import { SearchSuggestion } from '@/types/search';
import { TopicsByCategory } from '@/components/Topic/TopicsByCategory';
import { TopicList } from '@/components/Topic/TopicList';

export default function BrowsePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groupedTopics, setGroupedTopics] = useState<Record<string, Topic[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Expanded categories state is now handled in TopicsByCategory component
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { followedTopicIds } = useFollowContext();

  useEffect(() => {
    async function fetchTopics() {
      try {
        setIsLoading(true);
        const data = await HubService.getHubsByCategory();
        setTopics(data);
        const grouped = groupTopicsByCategory(data);
        setGroupedTopics(grouped);
      } catch (err) {
        setError('Failed to load topics');
        console.error('Error fetching topics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopics();
  }, []);

  // Icon helper functions are now imported from TopicIcons.ts

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
    }
  }, []);

  const handleSearchResults = useCallback((results: SearchSuggestion[]) => {
    setSearchResults(results);
  }, []);

  const handleSearching = useCallback((searching: boolean) => {
    setIsSearching(searching);
  }, []);

  const handleTabChange = (tab: 'all' | 'following') => {
    setActiveTab(tab);
    // Clear search when switching tabs
    setSearchQuery('');
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading topics...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </PageLayout>
    );
  }

  // Filter topics based on active tab
  const getFilteredTopics = () => {
    let topicsToFilter = topics;

    if (activeTab === 'following') {
      topicsToFilter = topicsToFilter.filter((topic) => followedTopicIds.includes(topic.id));
    }

    return groupTopicsByCategory(topicsToFilter);
  };

  const displayTopics = getFilteredTopics();

  return (
    <PageLayout>
      <BrowsePageHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        onSearchResults={handleSearchResults}
        onSearching={handleSearching}
        followingCount={followedTopicIds.length}
      />

      <div className="py-4 max-w-7xl mx-auto">
        {/* Show search results when searching */}
        {searchQuery && (
          <>
            {isSearching && (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  Searching topics...
                </div>
              </div>
            )}

            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No topics found matching "{searchQuery}"
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
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
                />
              </>
            )}
          </>
        )}

        {/* Show categorized topics when not searching */}
        {!searchQuery && <TopicsByCategory groupedTopics={displayTopics} />}
      </div>
    </PageLayout>
  );
}
