'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeedContent } from '@/components/Feed/FeedContent';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { DashboardSectionHeader } from '@/components/Funding/dashboard/DashboardSectionHeader';
import { FundingRows } from '@/components/Funding/dashboard/FundingRows';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeed } from '@/hooks/useFeed';
import type { ActivityCommentType } from '@/services/activity.service';

interface FundsReceivedProps {
  userId: number;
  authorId?: number;
}

/** Stable reference: a new array on every render would restart the activity feed. */
const PEER_REVIEW_COMMENT_TYPES: readonly ActivityCommentType[] = ['REVIEW', 'PEER_REVIEW'];

/** The researcher's proposals, drafts first, then the published ones. */
function MyProposals({ userId }: Readonly<{ userId: number }>) {
  const { startNew } = useFundingDrafting();
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    contentType: 'PREREGISTRATION',
    createdBy: userId,
    ordering: 'newest',
  });

  return (
    <section>
      <DashboardSectionHeader
        title="My proposals"
        action={
          // Money coming in reads emerald, like the tab this section sits under.
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600"
            onClick={() => startNew('need_funding')}
          >
            <Plus size={14} />
            New proposal
          </Button>
        }
      />

      <FundingRows
        kind="proposal"
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        includeDrafts
        emptyMessage="You have no proposals yet."
      />
    </section>
  );
}

function PeerReviewFeed({ authorId }: Readonly<{ authorId: number }>) {
  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    page,
    restorationTab,
    restoredScrollPosition,
    lastClickedEntryId,
  } = useActivityFeed({
    authorId,
    contentType: 'RHCOMMENTMODEL',
    commentTypes: PEER_REVIEW_COMMENT_TYPES,
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      showBountyFooter={false}
      hideActions
      isLoadingMore={isLoadingMore}
      noEntriesElement={
        <DashboardEmptyState>You have no published peer reviews.</DashboardEmptyState>
      }
      maxLength={150}
      showReadMoreCTA
      activeTab={restorationTab}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      shouldRenderBountyAsComment
      wideContent
    />
  );
}

function PeerReviews({ authorId }: Readonly<{ authorId?: number }>) {
  const hasAuthorId = authorId !== undefined && authorId > 0;

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900">Peer reviews</h2>
      {!hasAuthorId ? (
        <div className="mt-4">
          <DashboardEmptyState>
            Complete your researcher profile to publish peer reviews.
          </DashboardEmptyState>
        </div>
      ) : (
        <PeerReviewFeed authorId={authorId} />
      )}
    </section>
  );
}

export function FundsReceived({ userId, authorId }: Readonly<FundsReceivedProps>) {
  return (
    <div className="mb-6 space-y-8">
      <MyProposals userId={userId} />
      <PeerReviews authorId={authorId} />
    </div>
  );
}
