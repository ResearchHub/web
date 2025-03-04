'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { FeedTab } from '@/hooks/useFeed';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface TabItem {
  id: string;
  label: string;
}

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  isCustomizing: boolean;
  onTabChange: (tab: FeedTab) => void;
  onCustomizeChange?: (isCustomizing: boolean) => void;
  isLoading?: boolean;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  isCustomizing,
  onTabChange,
  onCustomizeChange,
  isLoading,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleTabChange = (tabId: string) => {
    onCustomizeChange?.(false);
    onTabChange(tabId as FeedTab);
  };

  const handleCustomizeClick = () => {
    onCustomizeChange?.(!isCustomizing);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />
        <Button
          variant={isCustomizing ? 'default' : 'ghost'}
          size="sm"
          onClick={() => executeAuthenticatedAction(handleCustomizeClick)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Settings className="w-5 h-5" />
          Customize
        </Button>
      </div>
    </div>
  );
};
