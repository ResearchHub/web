'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';

const fundingTabs = [
  { id: 'proposals', label: 'Proposals', href: '/funding' },
];

export const FundingPageTabs: FC = () => {
  const pathname = usePathname();

  const activeTab = 'proposals';

  return (
    <div className="pt-2 border-b border-gray-200">
      <Tabs tabs={fundingTabs} activeTab={activeTab} onTabChange={() => {}} />
    </div>
  );
};
