'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';

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
    label: 'Proposals',
    href: '/fund/proposals',
    icon: ArrowUpCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-primary-600 border-b-primary-600',
  },
];

export function MarketplaceCards({ selected = 'grants' }: MarketplaceCardsProps) {
  const { user, isLoading: isLoadingUser } = useUser();
  // Pull the tabs up only when the panel is or will be taller (snapshot visible).
  // Logged-out users see just the CTA (shorter panel), so no offset is needed.
  const snapshotVisible = isLoadingUser || !!user;

  return (
    <div className={snapshotVisible ? 'sm:-mt-10' : ''}>
      <Tabs
        tabs={marketplaceTabs}
        activeTab={selected}
        onTabChange={() => {}}
        variant="primary"
        className="mt-4"
      />
    </div>
  );
}
