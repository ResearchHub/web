'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FunderHero } from '@/components/Funding/dashboard/FunderHero';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FunderService } from '@/services/funder.service';
import { useFeed } from '@/hooks/useFeed';
import { useUser } from '@/contexts/UserContext';
import { FunderOverview } from '@/types/funder';

export const FunderDashboardPage: FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;

  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      createdBy: userId,
    }),
    [userId]
  );

  const {
    entries: opportunities,
    isLoading: isLoadingOpportunities,
    hasMore,
    loadMore,
  } = useFeed('all', grantFeedOptions);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingOverview(true);
    FunderService.getFundingOverview(userId)
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
  }, [userId]);

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
        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" disabled>
            All time
            <ChevronDown size={14} />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/notebook?newGrant=true')}
          >
            <Plus size={14} />
            New opportunity
          </Button>
        </div>
      </div>

      {/* Hero */}
      {isLoadingOverview ? (
        <div className="h-[320px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
      ) : overview ? (
        <FunderHero overview={overview} />
      ) : null}

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
