'use client';

import { FC, useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { InterestSelector, Interest } from '@/components/InterestSelector/InterestSelector';
import { useRequireAuth } from '@/hooks/useRequireAuth';

type FeedTab = 'for-you' | 'following' | 'popular' | 'latest';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onCustomizeComplete?: (interests: Interest[]) => void;
  onRefresh?: () => void;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  onTabChange,
  onCustomizeComplete,
  onRefresh,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { withAuth } = useRequireAuth();

  const tabs = [
    {
      id: 'for-you',
      label: 'For You',
    },
    {
      id: 'following',
      label: 'Following',
    },
    {
      id: 'popular',
      label: 'Popular',
    },
    {
      id: 'latest',
      label: 'Latest',
    },
  ];

  const handleTabChange = (tabId: string) => {
    setIsCustomizing(false);
    onTabChange(tabId as FeedTab);
  };

  const handleInterestSelection = (selectedInterests: Interest[]) => {
    setIsCustomizing(false);
    onCustomizeComplete?.(selectedInterests);
  };

  const handleCustomizeClick = (isCustomizing: boolean) => {
    withAuth(() => {
      setIsCustomizing(isCustomizing);
      if (!isCustomizing) {
        onRefresh?.();
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        <Button
          variant={isCustomizing ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCustomizeClick(!isCustomizing)}
          className="flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Customize
        </Button>
      </div>

      {isCustomizing && (
        <div className="mt-6">
          <InterestSelector mode="preferences" />
        </div>
      )}
    </div>
  );
};
