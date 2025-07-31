'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Loader } from '@/components/ui/Loader';

export type TabType = 'all' | 'in-review' | 'published' | 'about';

interface Tab {
  id: string;
  label: string;
}

interface JournalTabsProps {
  activeTab: TabType;
  tabs: Tab[];
  isLoading: boolean;
  onTabChange: (tab: TabType) => void;
}

export const JournalTabs: FC<JournalTabsProps> = ({ activeTab, tabs, isLoading, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="relative">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => onTabChange(id as TabType)}
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-6 top-4">
            <Loader size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};
