'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';

const fundingTabs = [
  { id: 'opportunities', label: 'Opportunities', href: '/funding' },
  { id: 'proposals', label: 'Proposals', href: '/funding/proposals' },
];

export const FundingPageTabs: FC = () => {
  const pathname = usePathname();

  const activeTab = pathname === '/funding/proposals' ? 'proposals' : 'opportunities';

  return (
    <div className="pt-2 border-b border-gray-200">
      <Tabs tabs={fundingTabs} activeTab={activeTab} onTabChange={() => {}} />
    </div>
  );
};
