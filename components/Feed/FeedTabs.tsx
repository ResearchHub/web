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
  href?: string;
  scroll?: boolean;
  customAction?: () => void;
}

export type FeedSortOption = 'hot_score_v2' | 'latest';

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  onTabChange: (tab: string, e?: React.MouseEvent) => void;
  isLoading?: boolean;
  showGearIcon?: boolean;
  onGearClick?: () => void;
  showSorting?: boolean;
  sortOption?: string;
  onSortChange?: (sort: string) => void;
  isCompact?: boolean;
  sortOptions?: SortOption[];
}

const defaultSortOptions: SortOption[] = [
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
  isCompact = false,
  sortOptions = defaultSortOptions,
}) => {
  const handleTabChange = (tabId: string, e?: React.MouseEvent) => {
    onTabChange(tabId, e);
  };

  const handleSortChange = (option: SortOption) => {
    if (onSortChange) {
      onSortChange(option.value);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-2 h-full">
        <div className="min-w-0 flex-1 h-full">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            disabled={isLoading}
            className={`!border-b-0 h-full py-0 ${isCompact ? 'h-[48px]' : 'h-[56px]'}`}
          />
        </div>
        {/* Sorting and gear icon for Following tab */}
        {(showSorting || showGearIcon) && (
          <div className="flex items-center gap-2 flex-shrink-0 self-center">
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
                className="p-1.5"
                aria-label="Edit topics"
              >
                <Settings className="w-3.5 h-3.5 text-gray-600" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
