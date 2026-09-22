'use client';

import type { ReactNode } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeed } from '@/hooks/useFeed';
import type { ActivityCommentType } from '@/services/activity.service';

interface FundsReceivedProps {
  userId: number;
  authorId?: number;
}

/** Stable reference: a new array on every render would restart the activity feed. */
const PEER_REVIEW_COMMENT_TYPES: readonly ActivityCommentType[] = ['REVIEW', 'PEER_REVIEW'];

function MyProposals({ userId }: Readonly<{ userId: number }>) {
  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed('all', {
    endpoint: 'funding_feed',
    contentType: 'PREREGISTRATION',
    createdBy: userId,
    ordering: 'newest',
  });

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900">My proposals</h2>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        activeTab="all"
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        lastClickedEntryId={lastClickedEntryId ?? undefined}
        showGrantHeaders={false}
        showPostHeaders={false}
        showFundraiseHeaders={false}
        hideActions
        skeletonVariant="fundraise"
        wideContent
        noEntriesElement={
          <DashboardEmptyState>You have no published proposals.</DashboardEmptyState>
        }
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
