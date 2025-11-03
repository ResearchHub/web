'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  customAction?: () => void;
}

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
  showGearIcon?: boolean;
  onGearClick?: () => void;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isLoading,
  showGearIcon = false,
  onGearClick,
}) => {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />
        {/* Edit topics button */}
        {showGearIcon && onGearClick && (
          <Button
            onClick={onGearClick}
            variant="ghost"
            size="sm"
            className="ml-3 whitespace-nowrap bg-gray-50 hover:bg-gray-100"
            aria-label="Edit topics"
          >
            <Edit3 className="w-4 h-4" />
            <span className="ml-2">Edit topics</span>
          </Button>
        )}
      </div>
    </div>
  );
};
