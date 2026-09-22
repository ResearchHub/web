'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { FundedProposalsSection } from '@/components/Funding/dashboard/FundedProposalsSection';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';
import { FunderOverview } from '@/types/funder';

interface FundsGivenProps {
  /** The funder whose page this is: the user, or the one a moderator is viewing. */
  viewedUserId: number;
  overview: FunderOverview | null;
}

/**
 * The Funds given column: the funder's RFPs, then the proposals they backed.
 * Their totals and recent activity live in the page's sidebar.
 */
export function FundsGiven({ viewedUserId, overview }: Readonly<FundsGivenProps>) {
  const router = useRouter();

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      createdBy: viewedUserId,
    }),
    [viewedUserId]
  );

  const {
    entries: opportunities,
    isLoading: isLoadingOpportunities,
    hasMore,
    loadMore,
  } = useFeed('all', grantFeedOptions);

  return (
    <>
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              My Requests for Proposals
            </h2>
            {!isLoadingOpportunities && (
              <span className="text-xs text-gray-500">{opportunities.length} active</span>
            )}
          </div>
          {!isLoadingOpportunities && opportunities.length > 0 && (
            <Button
              variant="outlined"
              size="sm"
              onClick={() => router.push('/notebook?newGrant=true')}
            >
              <Plus size={14} />
              New RFP
            </Button>
          )}
        </div>

        <FeedContent
          entries={opportunities}
          isLoading={isLoadingOpportunities}
          hasMore={hasMore}
          loadMore={loadMore}
          wideContent
          skeletonVariant="grant"
          showGrantApplyCta={false}
          showGrantHeaders={false}
          showPostHeaders={false}
          showFundraiseHeaders={false}
          noEntriesElement={
            <DashboardEmptyState>You haven&apos;t created any RFPs yet.</DashboardEmptyState>
          }
        />
      </div>

      {overview && (
        <FundedProposalsSection proposals={overview.supportedProposals} className="mt-8" />
      )}
    </>
  );
}
