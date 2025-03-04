'use client';

import { FC, useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { FeedTab } from '@/hooks/useFeed';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

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
  const [localIsCustomizing, setLocalIsCustomizing] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const [parentIsCustomizing, setParentIsCustomizing] = useState(false);

  useEffect(() => {
    const handleCustomizeChange = (value: boolean) => {
      if (value !== parentIsCustomizing) {
        setParentIsCustomizing(value);
        setLocalIsCustomizing(value);
      }
    };

    if (onCustomizeChange) {
      const originalOnCustomizeChange = onCustomizeChange;
      onCustomizeChange = (value: boolean) => {
        handleCustomizeChange(value);
        originalOnCustomizeChange(value);
      };
    }
  }, [onCustomizeChange, parentIsCustomizing]);

  const tabs = [
    {
      id: 'following',
      label: 'Following',
    },
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
    setLocalIsCustomizing(false);
    onCustomizeChange?.(false);
    onTabChange(tabId as FeedTab);
  };

  const handleCustomizeClick = () => {
    const newValue = !localIsCustomizing;
    setLocalIsCustomizing(newValue);
    if (onCustomizeChange) {
      onCustomizeChange(newValue);
    }
  };

  const handleSaveComplete = () => {
    setLocalIsCustomizing(false);
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
          disabled={isLoading}
        />
        <Button
          variant={localIsCustomizing ? 'default' : 'ghost'}
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
