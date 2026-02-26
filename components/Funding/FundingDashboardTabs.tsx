'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { CreateGrantButton } from '@/components/Grant/CreateGrantButton';

const dashboardTabs = [
  { id: 'opportunities', label: 'Opportunities', href: '/dashboard' },
  { id: 'impact', label: 'Impact', href: '/dashboard/impact' },
];

export const FundingDashboardTabs: FC = () => {
  const pathname = usePathname();

  const activeTab = pathname === '/dashboard/impact' ? 'impact' : 'opportunities';

  return (
    <div className="pt-2 border-b border-gray-200 flex items-center justify-between">
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onTabChange={() => {}} />
      <div className="flex-shrink-0 ml-4">
        <CreateGrantButton />
      </div>
    </div>
  );
};
