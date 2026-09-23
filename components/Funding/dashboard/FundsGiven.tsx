'use client';

import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { FundedProposalsSection } from '@/components/Funding/dashboard/FundedProposalsSection';
import { FundingRows } from '@/components/Funding/dashboard/FundingRows';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useFeed } from '@/hooks/useFeed';
import { FunderOverview } from '@/types/funder';

interface FundsGivenProps {
  /** The funder whose page this is: the user, or the one a moderator is viewing. */
  viewedUserId: number;
  /** The user is looking at their own page, so their drafts belong on it. */
  isOwnPage: boolean;
  overview: FunderOverview | null;
}

/**
 * The Funds given column: the funder's RFPs, drafts first, then the
 * proposals they backed. Their totals and recent activity live in the
 * page's sidebar.
 */
export function FundsGiven({ viewedUserId, isOwnPage, overview }: Readonly<FundsGivenProps>) {
  const { startNew } = useFundingDrafting();

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
      <section>
        <DashboardSectionHeader
          title="My Requests for Proposals"
          meta={!isLoadingOpportunities && `${opportunities.length} active`}
          action={
            isOwnPage && (
              <Button size="sm" onClick={() => startNew('fund')}>
                <Plus size={14} />
                New RFP
              </Button>
            )
          }
        />

        <FundingRows
          kind="rfp"
          entries={opportunities}
          isLoading={isLoadingOpportunities}
          hasMore={hasMore}
          loadMore={loadMore}
          includeDrafts={isOwnPage}
          emptyMessage="You haven't created any RFPs yet."
        />
      </section>

      {overview && (
        <FundedProposalsSection proposals={overview.supportedProposals} className="mt-8" />
      )}
    </>
  );
}
