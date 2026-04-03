'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';

export type MarketplaceTab = 'grants' | 'proposals';

interface MarketplaceCardsProps {
  selected?: MarketplaceTab;
}

const marketplaceTabs = [
  {
    id: 'grants',
    label: 'Funding Opportunities',
    href: '/fund',
    icon: ArrowDownCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-emerald-600 border-b-emerald-600',
  },
  {
    id: 'proposals',
    label: 'Open Proposals',
    href: '/fund/proposals',
    icon: ArrowUpCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-primary-600 border-b-primary-600',
  },
];

export function MarketplaceCards({ selected = 'grants' }: MarketplaceCardsProps) {
  return (
    <Tabs
      tabs={marketplaceTabs}
      activeTab={selected}
      onTabChange={() => {}}
      variant="primary"
      className="mt-4"
    />
  );
}
