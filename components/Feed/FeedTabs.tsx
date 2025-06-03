'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';
import { cn } from '@/utils/styles';

interface TabItem {
  id: string;
  label: string;
}

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  onTabChange: (tab: FeedTab) => void;
  isLoading?: boolean;
}

export const FeedTabs: FC<FeedTabsProps> = ({ activeTab, tabs, onTabChange, isLoading }) => {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as FeedTab);
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
      </div>
    </div>
  );
};
