'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  customAction?: () => void;
}

export type FeedSortOption = 'hot_score_v2' | 'latest';

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
  showGearIcon?: boolean;
  onGearClick?: () => void;
  showSorting?: boolean;
  sortOption?: FeedSortOption;
  onSortChange?: (sort: FeedSortOption) => void;
}

const sortOptions: SortOption[] = [
  { label: 'Best', value: 'hot_score_v2' },
  { label: 'Latest', value: 'latest' },
];

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isLoading,
  showGearIcon = false,
  onGearClick,
  showSorting = false,
  sortOption = 'hot_score_v2',
  onSortChange,
}) => {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  const handleSortChange = (option: SortOption) => {
    if (onSortChange) {
      onSortChange(option.value as FeedSortOption);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            disabled={isLoading}
          />
        </div>
        {/* Sorting and gear icon for Following tab */}
        {(showSorting || showGearIcon) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {showSorting && onSortChange && (
              <SortDropdown
                value={sortOption}
                onChange={handleSortChange}
                options={sortOptions}
                className="!min-w-[80px]"
              />
            )}
            {showGearIcon && onGearClick && (
              <Button
                onClick={onGearClick}
                variant="ghost"
                size="sm"
                className="p-2"
                aria-label="Edit topics"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
