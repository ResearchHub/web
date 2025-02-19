'use client';

import { FC, useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { InterestSelector, Interest } from '@/components/InterestSelector/InterestSelector';
import { cn } from '@/utils/styles';

type FeedTab = 'following' | 'latest';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onRefresh?: () => void;
  onCustomizeChange?: (isCustomizing: boolean) => void;
  isLoading?: boolean;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  onCustomizeChange,
  isLoading,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const tabs = [
    {
      id: 'following',
      label: 'Following',
    },
    {
      id: 'latest',
      label: 'Latest',
    },
  ];

  const handleTabChange = (tabId: string) => {
    if (isLoading) return;
    setIsCustomizing(false);
    onCustomizeChange?.(false);
    onTabChange(tabId as FeedTab);
  };

  const handleCustomizeClick = (customizing: boolean) => {
    if (isLoading) return;
    setIsCustomizing(customizing);
    onCustomizeChange?.(customizing);
  };

  const handleSaveComplete = () => {
    setIsCustomizing(false);
    onCustomizeChange?.(false);
    onRefresh?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className={cn(isLoading && 'opacity-50 pointer-events-none')}
        />
        <Button
          variant={isCustomizing ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCustomizeClick(!isCustomizing)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Settings className="w-5 h-5" />
          Customize
        </Button>
      </div>

      {isCustomizing && (
        <div className="mt-6">
          <InterestSelector mode="preferences" onSaveComplete={handleSaveComplete} />
        </div>
      )}
    </div>
  );
};
