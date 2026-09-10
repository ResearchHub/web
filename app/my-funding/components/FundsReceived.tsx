'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { EarnEarningsSummary } from '@/components/Earn/EarnEarningsSummary';
import { FeedContent } from '@/components/Feed/FeedContent';
import { buttonVariants } from '@/components/ui/Button';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeed } from '@/hooks/useFeed';
import type { ActivityCommentType } from '@/services/activity.service';
import { cn } from '@/utils/styles';

interface FundsReceivedProps {
  userId: number;
  authorId?: number;
}

/** Stable reference: a new array on every render would restart the activity feed. */
const PEER_REVIEW_COMMENT_TYPES: readonly ActivityCommentType[] = ['REVIEW', 'PEER_REVIEW'];

function EmptyState({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
      {children}
    </div>
  );
}

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
          <EmptyState>
            <p className="text-sm text-gray-600">You have no published proposals.</p>
            <Link
              href="/notebook?newFunding=true"
              className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}
            >
              Create a proposal
            </Link>
          </EmptyState>
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
        <EmptyState>
          <p className="text-sm text-gray-600">You have no published peer reviews.</p>
        </EmptyState>
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
          <EmptyState>
            <p className="text-sm text-gray-600">
              Complete your researcher profile to publish peer reviews.
            </p>
          </EmptyState>
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
      <EarnEarningsSummary />
      <MyProposals userId={userId} />
      <PeerReviews authorId={authorId} />
    </div>
  );
}
