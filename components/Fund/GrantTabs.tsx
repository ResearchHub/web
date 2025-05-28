'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { GrantTab } from './GrantsFeed';

interface GrantTabsProps {
  activeTab: GrantTab;
  onTabChange: (tab: GrantTab) => void;
  isLoading?: boolean;
}

export const GrantTabs: FC<GrantTabsProps> = ({ activeTab, onTabChange, isLoading }) => {
  const tabs = [
    { id: 'open' as GrantTab, label: 'Open Applications', count: null },
    { id: 'closed' as GrantTab, label: 'Closed', count: null },
    { id: 'all' as GrantTab, label: 'All', count: null },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={isLoading}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200',
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
