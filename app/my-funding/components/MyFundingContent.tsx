'use client';

import type { ReactNode } from 'react';
import { FundedResearchList } from '@/components/Funding/dashboard/FundedResearchList';
import { OwnProposalCards, RfpCards } from '@/components/Funding/dashboard/FundingWorkCards';
import { MyFundingEmptyState } from '@/components/Funding/dashboard/MyFundingEmptyState';
import { PeerReviewRows } from '@/components/Funding/dashboard/PeerReviewRows';
import { RecentActivityPreview } from '@/components/Funding/dashboard/RecentActivityPreview';
import { UpNext } from '@/components/Funding/dashboard/UpNext';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import type { MyFundingSeen } from '@/components/Funding/dashboard/hooks/useMyFundingSeen';
import type {
  FundedRow,
  OwnProposalModel,
  RfpCardModel,
  UpNextItem,
} from '@/components/Funding/dashboard/lib/myFundingModel';
import type { FeedEntry } from '@/types/feed';
import type { Note } from '@/types/note';

export type MyFundingTab = 'overview' | 'funded' | 'rfps' | 'proposals' | 'reviews' | 'activity';

/** How many of each list the Overview shows before "See all". */
const OVERVIEW_ROWS = 4;
const OVERVIEW_CARDS = 2;

interface MyFundingContentProps {
  readonly tab: Exclude<MyFundingTab, 'activity'>;
  readonly isSettled: boolean;
  readonly isEmpty: boolean;
  readonly latestDraft?: Note;
  /** The side the user is mostly on, whose sections come first. */
  readonly lead: 'giving' | 'raising';
  readonly upNext: readonly UpNextItem[];
  readonly fundedRows: readonly FundedRow[];
  readonly rfps: readonly RfpCardModel[];
  readonly ownProposals: readonly OwnProposalModel[];
  readonly rfpEntries: ReadonlyMap<number, FeedEntry>;
  readonly proposalEntries: ReadonlyMap<number, FeedEntry>;
  readonly reviews: {
    readonly entries: FeedEntry[];
    readonly total: number;
    readonly hasMore: boolean;
    readonly isLoadingMore: boolean;
    readonly loadMore: () => void;
  };
  /** Previewed at the foot of the Overview. */
  readonly activity: MyFundingActivity;
  readonly now: number;
  readonly seen: MyFundingSeen;
  readonly onTabChange: (tab: MyFundingTab) => void;
}

/**
 * The column of My Funding under its hero. The Overview leads with what needs
 * the user, then each side they are on, the bigger one first, and ends with a
 * preview of the activity; the other tabs show one of those lists in full.
 */
export function MyFundingContent({
  tab,
  isSettled,
  isEmpty,
  latestDraft,
  lead,
  upNext,
  fundedRows,
  rfps,
  ownProposals,
  rfpEntries,
  proposalEntries,
  reviews,
  activity,
  now,
  seen,
  onTabChange,
}: MyFundingContentProps) {
  if (!isSettled) return <ContentSkeleton />;
  if (isEmpty) return <MyFundingEmptyState latestDraft={latestDraft} />;

  const markReviewed = (rfp: { postId: number; proposalIds: readonly number[] }) =>
    seen.markProposalsSeen(rfp.postId, rfp.proposalIds);
  const overview = tab === 'overview';

  const funded = (
    <FundedResearchList
      key="funded"
      rows={fundedRows}
      limit={overview ? OVERVIEW_ROWS : undefined}
      onSeeAll={() => onTabChange('funded')}
    />
  );
  const rfpCards = (
    <RfpCards
      key="rfps"
      rfps={rfps}
      entries={rfpEntries}
      newProposalCount={seen.newProposalCount}
      onReview={markReviewed}
      limit={overview ? OVERVIEW_CARDS : undefined}
      onSeeAll={() => onTabChange('rfps')}
    />
  );
  const proposals = (
    <OwnProposalCards
      key="proposals"
      proposals={ownProposals}
      entries={proposalEntries}
      now={now}
      limit={overview ? OVERVIEW_CARDS : undefined}
      onSeeAll={() => onTabChange('proposals')}
    />
  );
  const peerReviews = reviews.entries.length > 0 && (
    <PeerReviewRows
      key="reviews"
      entries={reviews.entries}
      total={reviews.total}
      hasMore={reviews.hasMore}
      isLoadingMore={reviews.isLoadingMore}
      loadMore={reviews.loadMore}
    />
  );

  let sections: ReactNode[];
  switch (tab) {
    case 'funded':
      sections = [funded];
      break;
    case 'rfps':
      sections = [rfpCards];
      break;
    case 'proposals':
      sections = [proposals];
      break;
    case 'reviews':
      sections = [peerReviews];
      break;
    default:
      sections =
        lead === 'raising'
          ? [proposals, peerReviews, funded, rfpCards]
          : [funded, rfpCards, proposals, peerReviews];
  }

  return (
    <div className="mb-6 space-y-12">
      {overview && (
        <UpNext items={upNext} onFollow={(item) => item.rfp && markReviewed(item.rfp)} />
      )}
      {sections}
      {overview && (
        <RecentActivityPreview
          activity={activity}
          firstScientist={fundedRows[0]?.scientist.fullName}
          onSeeAll={() => onTabChange('activity')}
        />
      )}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li key={index} className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </ul>
  );
}
