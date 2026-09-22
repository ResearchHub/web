'use client';

import { useEffect, type ReactNode } from 'react';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import type { FundingDirection } from '@/components/Funding/fundingDirection';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundsGiven } from '@/components/Funding/dashboard/FundsGiven';
import { ModeratorViewAsFunder } from '@/components/Funding/dashboard/ModeratorViewAsFunder';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import { FundsReceived } from './FundsReceived';

type MyFundingTab = 'given' | 'received';

/**
 * Tab label with the direction of the money in a circle: out of the wallet for
 * funds given, into it for funds received. The arrow inherits the tab's own
 * color so it picks up the active/inactive treatment for free.
 */
function TabLabel({ direction, children }: { direction: FundingDirection; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <FundingDirectionIcon direction={direction} colored={false} />
      {children}
    </span>
  );
}

const MY_FUNDING_TABS = [
  {
    id: 'given',
    label: <TabLabel direction="giving">Funds given</TabLabel>,
    href: '/my-funding?tab=given',
  },
  {
    id: 'received',
    label: <TabLabel direction="receiving">Funds received</TabLabel>,
    href: '/my-funding?tab=received',
    // Money coming in reads green, matching the emerald treatment the Fund
    // tabs already use for the inbound side.
    activeClassName: 'text-emerald-600 border-b-emerald-600',
  },
];

function resolveMyFundingTab(tab: string | null): MyFundingTab {
  return tab === 'received' ? 'received' : 'given';
}

export function MyFundingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isLoadingUser } = useUser();
  const activeTab = resolveMyFundingTab(searchParams.get('tab'));
  const isModerator = !!user?.isModerator;
  const hasModeratorOverrideOnReceivedTab =
    activeTab === 'received' && isModerator && searchParams.has('user_id');

  useEffect(() => {
    if (isLoadingUser) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (!hasModeratorOverrideOnReceivedTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('user_id');
    router.replace(`/my-funding?${params.toString()}`, { scroll: false });
  }, [hasModeratorOverrideOnReceivedTab, isLoadingUser, router, searchParams, user]);

  if (isLoadingUser || !user || hasModeratorOverrideOnReceivedTab) return null;

  return (
    <PageLayout contentWidth="narrow">
      <Tabs
        tabs={MY_FUNDING_TABS}
        activeTab={activeTab}
        onTabChange={() => {}}
        rightContent={isModerator && activeTab === 'given' ? <ModeratorViewAsFunder /> : undefined}
      />

      <div className="mt-6">
        {activeTab === 'given' ? (
          <FundsGiven userId={user.id} isModerator={isModerator} />
        ) : (
          <FundsReceived userId={user.id} authorId={user.authorProfile?.id} />
        )}
      </div>
    </PageLayout>
  );
}
