'use client';

import { FC } from 'react';
import { Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { Tabs } from '@/components/ui/Tabs';
import { PillTabs } from '@/components/ui/PillTabs';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  href?: string;
  scroll?: boolean;
  separator?: boolean;
  icon?: import('lucide-react').LucideIcon;
  customAction?: () => void;
}

export type FeedSortOption = 'hot_score_v2' | 'latest';

interface FeedTabsProps {
  activeTab: string;
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
  sortOptions = defaultSortOptions,
}) => {
  const searchParams = useSearchParams();
  const useLegacyTabs = searchParams.get('exp') === 'tabs';

  const handleSortChange = (option: SortOption) => {
    onSortChange?.(option.value);
  };

  const firstSeparatorIdx = tabs.findIndex((tab) => tab.separator);
  const coreTabs = firstSeparatorIdx === -1 ? tabs : tabs.slice(0, firstSeparatorIdx);

  const tabContent = useLegacyTabs ? (
    <Tabs
      tabs={coreTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      disabled={isLoading}
      className="!border-b-0 h-full py-0"
    />
  ) : (
    <PillTabs
      tabs={coreTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      disabled={!!isLoading}
      size="lg"
    />
  );

  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-2 h-full">
        <div className="min-w-0 flex-1 h-full">{tabContent}</div>

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
              <button
                onClick={onGearClick}
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Settings className="w-4.5 h-4.5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
