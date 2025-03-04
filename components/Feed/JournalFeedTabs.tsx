'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';

export type JournalFeedTab = Extract<FeedTab, 'latest' | 'popular'>;

interface JournalFeedTabsProps {
  activeTab: JournalFeedTab;
  onTabChange: (tab: JournalFeedTab) => void;
}

export const JournalFeedTabs: FC<JournalFeedTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'latest',
      label: 'Latest',
    },
    {
      id: 'popular',
      label: 'Popular',
    },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as JournalFeedTab);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};
