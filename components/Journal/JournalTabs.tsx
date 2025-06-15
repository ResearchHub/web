'use client';

import { FC } from 'react';
import { Loader } from '@/components/ui/Loader';

interface Tab {
  id: string;
  label: string;
}

interface JournalTabsProps {
  activeTab: string;
  tabs: Tab[];
  isLoading: boolean;
  onTabChange: (tab: any) => void;
}

export const JournalTabs: FC<JournalTabsProps> = ({ activeTab, tabs, isLoading, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            disabled={isLoading}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="absolute right-6 top-4">
          <Loader size="sm" />
        </div>
      )}
    </div>
  );
};
