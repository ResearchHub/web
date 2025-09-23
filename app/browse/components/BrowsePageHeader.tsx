'use client';

import { TopicSearch } from '@/components/Search/TopicSearch';
import { SearchSuggestion } from '@/types/search';
import { ButtonGroup } from '@/components/ui/ButtonGroup';

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
    <div className="px-0 py-6 mb-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Topics</h1>

        <div className="flex flex-col lg:!flex-row gap-4 items-start lg:!items-center justify-between">
          <div className="w-full lg:!w-96 order-2 lg:!order-1">
            <TopicSearch
              placeholder={activeTab === 'following' ? 'Search followed topics' : 'Search topics'}
              onSearch={onSearch}
              onSearchResults={onSearchResults}
              onSearching={onSearching}
              className="w-full"
            />
          </div>

          <div className="order-1 lg:!order-2 flex-shrink-0">
            <ButtonGroup
              variant="pill"
              value={activeTab}
              onChange={(value) => onTabChange(value as 'all' | 'following')}
              options={[
                { value: 'all', label: 'All Topics' },
                { value: 'following', label: 'Following', badge: followingCount },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
