'use client';

import { TopicSearch } from '@/components/Search/TopicSearch';
import { SearchSuggestion } from '@/types/search';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrid3 as faGrid3Light } from '@fortawesome/pro-light-svg-icons';

interface BrowsePageHeaderProps {
  activeTab: 'all' | 'following';
  onTabChange: (tab: 'all' | 'following') => void;
  onSearch?: (query: string) => void;
  onSearchResults?: (results: SearchSuggestion[]) => void;
  onSearching?: (isSearching: boolean) => void;
  followingCount?: number;
  showTitle?: boolean;
}

export function BrowsePageHeader({
  activeTab,
  onTabChange,
  onSearch,
  onSearchResults,
  onSearching,
  followingCount = 0,
  showTitle = true,
}: BrowsePageHeaderProps) {
  return (
    <div className="px-0 py-6 mb-6">
      <div className="max-w-7xl mx-auto">
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Topics</h2>
            <MainPageHeader
              icon={<FontAwesomeIcon icon={faGrid3Light} fontSize={24} color="#3971ff" />}
              title="Browse"
              subtitle="Discover and follow research topics"
              showTitle={false}
            />
          </div>
        )}

        <div className="flex flex-col lg:!flex-row gap-4 items-start lg:!items-center justify-between">
          <div className="w-full lg:!w-96 order-2 lg:!order-1">
            <TopicSearch
              placeholder={
                activeTab === 'following'
                  ? 'Filter followed topics'
                  : 'Filter topics (AI, bioinformatics, etc.)'
              }
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
