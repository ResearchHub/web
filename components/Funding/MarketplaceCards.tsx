'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';

export type MarketplaceTab = 'grants' | 'proposals';

const MARKETPLACE_TABS = [
  {
    id: 'grants' as const,
    label: 'Funding Opportunities',
    href: '/fund',
    icon: ArrowDownCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-emerald-600 border-b-emerald-600',
  },
  {
    id: 'proposals' as const,
    label: 'Proposals',
    href: '/fund/proposals',
    icon: ArrowUpCircle,
    iconClassName: 'w-5 h-5',
    activeClassName: 'text-primary-600 border-b-primary-600',
  },
];

interface MarketplaceCardsProps {
  selected?: MarketplaceTab;
}

export function MarketplaceCards({ selected = 'grants' }: MarketplaceCardsProps) {
  const { user, isLoading: isLoadingUser } = useUser();
  // Pull the tabs up only when the panel is or will be taller (snapshot visible).
  // Logged-out users see just the CTA (shorter panel), so no offset is needed.
  const snapshotVisible = isLoadingUser || !!user;
  const tabsSentinelRef = useContentTabsVisibilitySentinel();

  return (
    <div ref={tabsSentinelRef} className={snapshotVisible ? 'sm:-mt-10' : ''}>
      <Tabs
        tabs={MARKETPLACE_TABS}
        activeTab={selected}
        onTabChange={() => {}}
        variant="primary"
        className="mt-4"
      />
    </div>
  );
}
