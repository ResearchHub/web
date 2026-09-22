'use client';

import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { FundedProposalsSection } from '@/components/Funding/dashboard/FundedProposalsSection';
import { NoteDrafts } from '@/components/Funding/dashboard/NoteDrafts';
import { PublishedFeedEntry } from '@/components/Funding/dashboard/PublishedFeedEntry';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { FeedContent } from '@/components/Feed/FeedContent';
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

        <div className="space-y-4">
          {isOwnPage && <NoteDrafts kind="rfp" />}

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
            renderEntry={({ entry, index, ordering, ...tracking }) => (
              <PublishedFeedEntry
                entry={entry}
                index={index}
                feedOrdering={ordering}
                showGrantApplyCta={false}
                showGrantHeaders={false}
                showPostHeaders={false}
                showFundraiseHeaders={false}
                {...tracking}
              />
            )}
            noEntriesElement={
              <DashboardEmptyState>You haven&apos;t created any RFPs yet.</DashboardEmptyState>
            }
          />
        </div>
      </section>

      {overview && (
        <FundedProposalsSection proposals={overview.supportedProposals} className="mt-8" />
      )}
    </>
  );
}
