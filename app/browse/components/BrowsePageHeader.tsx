'use client';

import { TopicSearch } from '@/components/Search/TopicSearch';
import { SearchSuggestion } from '@/types/search';

interface BrowsePageHeaderProps {
  activeTab: 'all' | 'following';
  onTabChange: (tab: 'all' | 'following') => void;
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchSuggestion[]) => void;
  onSearching?: (isSearching: boolean) => void;
  followingCount?: number;
}

export function BrowsePageHeader({
  activeTab,
  onTabChange,
  onSearch,
  onSearchResults,
  onSearching,
  followingCount = 0,
}: BrowsePageHeaderProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 -mx-4 px-4 py-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Topics</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-96">
            <TopicSearch
              placeholder="Search topics"
              onSearch={onSearch}
              onSearchResults={onSearchResults}
              onSearching={onSearching}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onTabChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => onTabChange('following')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'following'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Following
              {followingCount > 0 && (
                <span className="bg-gray-300 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
                  {followingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
