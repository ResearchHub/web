'use client';

import { useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useEarningOverview } from '@/components/Earn/lib/hooks/useEarningOverview';
import { FUNDING_KIND_ICON } from '@/components/Funding/fundingKind';
import {
  hasMyFundingGivingStats,
  MyFundingSummary,
} from '@/components/Funding/dashboard/MyFundingSummary/MyFundingSummary';
import {
  parseViewedFunderId,
  useFunderOverview,
} from '@/components/Funding/dashboard/hooks/useFunderOverview';
import { ModeratorViewAsFunder } from '@/components/Funding/dashboard/ModeratorViewAsFunder';
import { useMyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { Button } from '@/components/ui/Button';
import { HeroHeader } from '@/components/ui/HeroHeader';
import {
  RadiatingDotTabIcon,
  RadiatingDotTabIconActive,
} from '@/components/ui/RadiatingDotTabIcon';
import { Tabs } from '@/components/ui/Tabs';
import { useUser } from '@/contexts/UserContext';
import type { EarningOverview } from '@/types/user';
import { MyFundingActivityContent } from './MyFundingActivityContent';
import { MyFundingContent } from './MyFundingContent';
import { MyFundingDataError } from './MyFundingDataError';
import { MyFundingSidebar } from './MyFundingSidebar';

/** What the Funds received half shows for someone who has earned nothing yet. */
const NO_EARNINGS: EarningOverview = {
  totalEarned: { rsc: 0, rscUsdSnapshot: 0, usd: 0 },
  bySource: {},
};

/**
 * One dashboard for both sides of funding. The page does not ask whether its
 * user gives or receives: it shows their numbers in a band, and under it
 * what they have written. Beside the column is the same compact activity
 * rail used by RFP pages.
 */
export function MyFundingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isLoadingUser } = useUser();
  const { startNew } = useFundingDrafting();
  const isModerator = !!user?.isModerator;

  // A moderator may view another funder's page; everyone else sees their own.
  const viewedUserId =
    (isModerator ? parseViewedFunderId(searchParams.get('user_id')) : undefined) ?? user?.id;
  const isOwnPage = viewedUserId != null && viewedUserId === user?.id;
  const activeTab = searchParams.get('tab') === 'activity' ? 'activity' : 'overview';
  const activity = useMyFundingActivity({
    viewedUserId,
    authorId: isOwnPage ? user?.authorProfile?.id : undefined,
  });

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'activity') {
      params.set('tab', 'activity');
    } else {
      params.delete('tab');
    }
    const query = params.toString();
    router.push(`/my-funding${query ? `?${query}` : ''}`, { scroll: false });
  };

  const {
    overview,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useFunderOverview(viewedUserId);
  // Earnings are the user's own: a moderator's view of another funder reads
  // that funder's giving and nothing of their receiving.
  const {
    overview: earnings,
    isLoading: isLoadingEarnings,
    error: earningsError,
  } = useEarningOverview(isOwnPage ? user?.id : undefined);

  useEffect(() => {
    if (!isLoadingUser && !user) router.replace('/');
  }, [isLoadingUser, router, user]);

  if (isLoadingUser || !user || viewedUserId == null) {
    return null;
  }

  // Funds given is there once something has been given. Funds received is
  // always there on the user's own page, at zero until they earn something; a
  // moderator's view of another funder has no earnings to show.
  const giving = !overviewError && hasMyFundingGivingStats(overview) ? overview : null;
  const earned = isOwnPage && !earningsError ? (earnings ?? NO_EARNINGS) : null;
  const isLoadingStats = isLoadingOverview || (isOwnPage && isLoadingEarnings);
  const showStats = isLoadingStats || giving != null || earned != null;
  const hasStatsError = overviewError != null || (isOwnPage && earningsError != null);

  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebar={<MyFundingSidebar activity={activity} />}
      rightSidebarTopOffset="aligned"
      topBanner={
        <HeroHeader
          title="My Funding"
          subtitle={
            <span className="text-base text-gray-500">
              {isOwnPage
                ? 'Manage your RFPs, proposals, funding activity, and earnings.'
                : "Review this funder's published RFPs and funding activity."}
            </span>
          }
          cta={
            isOwnPage && (
              <div className="flex w-full flex-col gap-2 sm:w-fit">
                <Button
                  size="lg"
                  onClick={() => startNew('fund')}
                  className="w-full gap-2 font-semibold shadow-sm sm:w-auto"
                >
                  <FontAwesomeIcon icon={FUNDING_KIND_ICON.rfp} className="h-5 w-5" />
                  New RFP
                </Button>
                <Button
                  size="lg"
                  variant="outlined"
                  onClick={() => startNew('need_funding')}
                  className="w-full gap-2 sm:w-auto"
                >
                  <FontAwesomeIcon icon={FUNDING_KIND_ICON.proposal} className="h-5 w-5" />
                  New proposal
                </Button>
              </div>
            )
          }
          contentWidth="narrow"
        >
          <div className="mt-3 sm:mt-4 lg:pr-80">
            <Tabs
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  icon: LayoutDashboard,
                  iconClassName: 'h-[18px] w-[18px]',
                },
                {
                  id: 'activity',
                  label: 'Activity',
                  icon: RadiatingDotTabIcon,
                  activeIcon: RadiatingDotTabIconActive,
                  iconClassName: 'h-[18px] w-[18px]',
                },
              ]}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              rightContent={isModerator ? <ModeratorViewAsFunder variant="tab" /> : undefined}
            />
          </div>
        </HeroHeader>
      }
    >
      {activeTab === 'activity' ? (
        <MyFundingActivityContent activity={activity} />
      ) : (
        <>
          {hasStatsError && (
            <div className="mb-4">
              <MyFundingDataError message="Some funding data failed to load. Please refresh and try again." />
            </div>
          )}
          {showStats && (
            <MyFundingSummary
              className="mt-0"
              overview={giving}
              earnings={earned}
              isLoading={isLoadingStats}
              isOwnPage={isOwnPage}
            />
          )}

          <div className="mt-8">
            {/* Keyed by the funder, so a moderator switching funders starts from a clean load. */}
            <MyFundingContent
              key={viewedUserId}
              viewedUserId={viewedUserId}
              isOwnPage={isOwnPage}
              authorId={user.authorProfile?.id}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}
