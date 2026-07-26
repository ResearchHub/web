'use client';

import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';
import { FUND_TABS, type FundTab } from '@/hooks/useFundTabs';

export type MarketplaceTab = FundTab;

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
        tabs={FUND_TABS}
        activeTab={selected}
        onTabChange={() => {}}
        variant="primary"
        className="mt-4"
      />
    </div>
  );
}
