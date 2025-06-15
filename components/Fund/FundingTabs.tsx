'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FundingTab } from '@/hooks/useFeed';

interface TabItem {
  id: FundingTab;
  label: string;
}

interface FundingTabsProps {
  activeTab: FundingTab;
  onTabChange: (tab: FundingTab) => void;
  isLoading?: boolean;
}

export const FundingTabs: FC<FundingTabsProps> = ({ activeTab, onTabChange, isLoading }) => {
  const tabs: TabItem[] = [
    {
      id: 'open',
      label: 'Needs Funding',
    },
    {
      id: 'closed',
      label: 'Completed',
    },
    {
      id: 'all',
      label: 'All',
    },
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId as FundingTab);
  };

  return (
    <div className="border-b mb-6">
      <nav className="flex space-x-8 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-1 py-4 text-md font-medium border-b-2 ${
              activeTab === tab.id
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => handleTabChange(tab.id)}
            disabled={isLoading}
          >
            <div className="flex items-center">{tab.label}</div>
          </button>
        ))}
      </nav>
    </div>
  );
};
