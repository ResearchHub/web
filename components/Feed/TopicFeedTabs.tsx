'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';

export type TopicFeedTab = Extract<FeedTab, 'latest'>;

interface TopicFeedTabsProps {
  activeTab: TopicFeedTab;
  onTabChange: (tab: TopicFeedTab) => void;
  isLoading?: boolean;
}

export const TopicFeedTabs: FC<TopicFeedTabsProps> = ({ activeTab, onTabChange, isLoading }) => {
  const tabs = [
    {
      id: 'latest',
      label: 'Latest',
    },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as TopicFeedTab);
  };

  return (
    <div className="flex items-center justify-between">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} disabled={isLoading} />
    </div>
  );
};
