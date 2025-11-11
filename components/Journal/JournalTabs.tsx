'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import Icon from '@/components/ui/icons/Icon';

export type TabType = 'all' | 'in-review' | 'published' | 'about';

interface Tab {
  id: string;
  label: string;
}

interface JournalTabsProps {
  activeTab: TabType;
  tabs: Tab[];
  isLoading?: boolean;
  onTabChange: (tab: TabType) => void;
}

export const JournalTabs: FC<JournalTabsProps> = ({ activeTab, tabs, isLoading, onTabChange }) => {
  // On mobile, show all tabs together
  // On desktop, separate the about tab
  const mainTabs = tabs.filter((tab) => tab.id !== 'about');
  const aboutTab = tabs.find((tab) => tab.id === 'about');

  return (
    <div className="mb-6">
      {/* Mobile view - all tabs together */}
      <div className="block sm:!hidden border-b border-gray-200">
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

      {/* Desktop view - about as floating button */}
      <div className="hidden sm:!block">
        <div className="relative">
          <div className="border-b border-gray-200">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <Tabs
                  tabs={mainTabs}
                  activeTab={activeTab}
                  onTabChange={(id) => onTabChange(id as TabType)}
                  disabled={isLoading}
                />
              </div>

              {aboutTab && (
                <div className="ml-auto pb-2">
                  <button
                    onClick={() => !isLoading && onTabChange('about')}
                    className={cn(
                      'px-4 py-1.5 text-sm font-medium rounded-md border transition-all duration-200 flex items-center gap-1.5',
                      activeTab === 'about'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                        : 'bg-blue-50/50 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-sm',
                      isLoading && 'opacity-50 cursor-not-allowed pointer-events-none'
                    )}
                    disabled={isLoading}
                  >
                    <Icon
                      name="rhJournal2"
                      size={16}
                      color={activeTab === 'about' ? '#1d4ed8' : '#2563eb'}
                    />
                    <span>{aboutTab.label}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
