'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';

const dashboardTabs = [
  { id: 'opportunities', label: 'Opportunities', href: '/dashboard' },
  { id: 'impact', label: 'Impact', href: '/dashboard/impact' },
];

export const FundingDashboardTabs: FC = () => {
  const pathname = usePathname();

  const activeTab = pathname === '/dashboard/impact' ? 'impact' : 'opportunities';

  return (
    <div className="pt-2 border-b border-gray-200">
      <Tabs tabs={dashboardTabs} activeTab={activeTab} onTabChange={() => {}} />
    </div>
  );
};
