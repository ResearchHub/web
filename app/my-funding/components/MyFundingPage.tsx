'use client';

import { useEffect, type ReactNode } from 'react';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import type { FundingDirection, FundingIntent } from '@/components/Funding/fundingDirection';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { StartConversationBox } from '@/components/AIMode/start/StartConversationBox';
import { FundsGiven } from '@/components/Funding/dashboard/FundsGiven';
import {
  parseViewedFunderId,
  useFunderOverview,
} from '@/components/Funding/dashboard/hooks/useFunderOverview';
import { ModeratorViewAsFunder } from '@/components/Funding/dashboard/ModeratorViewAsFunder';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import { isHubEditorOrModerator } from '@/utils/permissions';
import { FundsReceived } from './FundsReceived';
import { EarningsTotals } from '@/components/Funding/dashboard/EarningsTotals';
import { FunderTotals } from '@/components/Funding/dashboard/FunderTotals';
import { FundsGivenActivity, FundsReceivedActivity } from './MyFundingSidebar';

type MyFundingTab = 'given' | 'received';

/** Each tab is one side of the money: the composer under it starts a conversation for that side. */
const TAB_INTENT: Record<MyFundingTab, FundingIntent> = {
  given: 'fund',
  received: 'need_funding',
};

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

  // A moderator may view another funder's page; everyone else sees their own.
  const viewedUserId =
    (isModerator ? parseViewedFunderId(searchParams.get('user_id')) : undefined) ?? user?.id;
  const { overview, isLoading: isLoadingOverview } = useFunderOverview(
    activeTab === 'given' ? viewedUserId : undefined
  );
  // The workspace is still rolling out; the composer shows to the same people as its nav item.
  const canStartConversation = isHubEditorOrModerator(user);

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

  if (isLoadingUser || !user || hasModeratorOverrideOnReceivedTab || viewedUserId == null) {
    return null;
  }

  // The totals sit above the gray activity rail, where the funding power card
  // sits on other pages; below `lg` the rail hides, so they lead the column.
  const totals =
    activeTab === 'given' ? (
      <FunderTotals overview={overview} isLoading={isLoadingOverview} />
    ) : (
      <EarningsTotals />
    );

  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebarAbove={totals}
      rightSidebarFill
      rightSidebar={
        activeTab === 'given' ? (
          <FundsGivenActivity viewedUserId={viewedUserId} />
        ) : (
          <FundsReceivedActivity authorId={user.authorProfile?.id} />
        )
      }
    >
      <Tabs
        tabs={MY_FUNDING_TABS}
        activeTab={activeTab}
        onTabChange={() => {}}
        rightContent={isModerator && activeTab === 'given' ? <ModeratorViewAsFunder /> : undefined}
      />

      <div className="mt-6 lg:!hidden">{totals}</div>

      {canStartConversation && (
        <StartConversationBox intent={TAB_INTENT[activeTab]} className="mt-6" />
      )}

      <div className="mt-6">
        {activeTab === 'given' ? (
          <FundsGiven viewedUserId={viewedUserId} overview={overview} />
        ) : (
          <FundsReceived userId={user.id} authorId={user.authorProfile?.id} />
        )}
      </div>
    </PageLayout>
  );
}
