'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FunderHero } from '@/components/Funding/dashboard/FunderHero';
import { useFunderActivity } from '@/components/Funding/dashboard/hooks/useFunderActivity';
import { ActivityStoryCarousel } from '@/components/Activity/ActivityStoryCarousel';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FunderService } from '@/services/funder.service';
import { useFeed } from '@/hooks/useFeed';
import { useUser } from '@/contexts/UserContext';
import { FunderOverview } from '@/types/funder';

function parseFunderIdParam(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const FunderDashboardPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const userId = user?.id;

  // Optional ?funder_id=N override scopes the funder-specific data (hero
  // overview + activity feed) to that funder. Falls back to the logged-in user.
  const funderIdOverride = parseFunderIdParam(searchParams.get('funder_id'));
  const funderId = funderIdOverride ?? userId;

  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      // The override `funderId` is resolved at the call site and passed in
      // as `created_by` so we don't have to duplicate the override logic in
      // the lower-level services.
      createdBy: funderId,
      // Defer the initial fetch until funderId is known so we don't fire a
      // first request without `created_by` and a second with it.
      enabled: funderId != null,
    }),
    [funderId]
  );

  const {
    entries: opportunities,
    isLoading: isLoadingOpportunities,
    hasMore,
    loadMore,
  } = useFeed('all', grantFeedOptions);

  const {
    entries: activityEntries,
    isLoading: isLoadingActivity,
    hasMore: hasMoreActivity,
    loadMore: loadMoreActivity,
  } = useFunderActivity(funderId);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingOverview(true);
    FunderService.getFundingOverview(funderId)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOverview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [funderId]);

  const firstName = user?.firstName?.trim() || 'there';

  return (
    <div className="px-4 tablet:px-8 py-6 max-w-[1180px] mx-auto w-full">
      {/* Welcome row */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Welcome back, {firstName}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s where your funding stands today.</p>
        </div>
        <Button variant="default" size="sm" onClick={() => router.push('/notebook?newGrant=true')}>
          <Plus size={14} />
          New opportunity
        </Button>
      </div>

      {/* Hero */}
      {isLoadingOverview ? (
        <div className="h-[320px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
      ) : overview ? (
        <FunderHero overview={overview} />
      ) : null}

      {/* Activity stories */}
      {funderId && (
        <ActivityStoryCarousel
          entries={activityEntries}
          isLoading={isLoadingActivity}
          hasMore={hasMoreActivity}
          loadMore={loadMoreActivity}
          title="Recent activity"
          className="mt-6"
        />
      )}

      {/* Opportunities */}
      <div className="mt-6">
        <div className="flex items-baseline gap-2.5 mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            My funding opportunities
          </h2>
          {!isLoadingOpportunities && (
            <span className="text-xs text-gray-500">{opportunities.length} active</span>
          )}
        </div>

        <FeedContent
          entries={opportunities}
          isLoading={isLoadingOpportunities}
          hasMore={hasMore}
          loadMore={loadMore}
          wideContent
          showGrantHeaders={false}
          showPostHeaders={false}
          showFundraiseHeaders={false}
          noEntriesElement={
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
              <p className="text-sm text-gray-500">
                You haven&apos;t created any opportunities yet.
              </p>
              <Button
                variant="outlined"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/notebook?newGrant=true')}
              >
                <Plus size={14} />
                Create your first opportunity
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};
