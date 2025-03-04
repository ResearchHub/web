'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';

export type TopicFeedTab = Extract<FeedTab, 'latest' | 'popular'>;

interface TabItem {
  id: string;
  label: string;
}

interface TopicFeedTabsProps {
  activeTab: TopicFeedTab;
  tabs?: TabItem[];
  onTabChange: (tab: TopicFeedTab) => void;
  isLoading?: boolean;
}

export const TopicFeedTabs: FC<TopicFeedTabsProps> = ({
  activeTab,
  tabs: propTabs,
  onTabChange,
  isLoading,
}) => {
  const defaultTabs = [
    {
      id: 'latest',
      label: 'Latest',
    },
    {
      id: 'popular',
      label: 'Popular',
    },
  ];

  const tabs = propTabs || defaultTabs;

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as TopicFeedTab);
  };

  return (
    <div className="flex items-center justify-between">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} disabled={isLoading} />
    </div>
  );
};
