'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useRouter } from 'next/navigation';

export type MarketplaceTab = 'grants' | 'needs-funding' | 'previously-funded';

interface MarketplaceTabsProps {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  disableTabs?: boolean;
}

export const MarketplaceTabs: FC<MarketplaceTabsProps> = ({
  activeTab,
  onTabChange,
  disableTabs,
}) => {
  const router = useRouter();

  const tabs = [
    {
      id: 'grants',
      label: 'Request for Proposals',
    },
    {
      id: 'needs-funding',
      label: 'Proposals',
    },
    {
      id: 'previously-funded',
      label: 'Previously Funded',
    },
  ];

  const handleTabChange = (tabId: string) => {
    if (disableTabs) return;

    const tab = tabId as MarketplaceTab;

    // Navigate to the appropriate route
    if (tab === 'grants') {
      router.push('/fund/grants');
    } else if (tab === 'needs-funding') {
      router.push('/fund/needs-funding');
    } else if (tab === 'previously-funded') {
      router.push('/fund/previously-funded');
    }

    onTabChange(tab);
  };

  return (
    <div className="bg-white pb-6">
      <div className="full-w border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="primary"
            className="border-b-0"
          />
        </div>
      </div>
    </div>
  );
};
