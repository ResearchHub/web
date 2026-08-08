'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EARN_BOUNTIES_ANCHOR } from '@/components/Earn/EarnDashboard';
import { EarnEarningsSummary } from '@/components/Earn/EarnEarningsSummary';
import { EarnOpportunities } from '@/components/Earn/EarnOpportunities';
import { FeedContent } from '@/components/Feed/FeedContent';
import { buttonVariants } from '@/components/ui/Button';
import { useContributions } from '@/hooks/useContributions';
import { useFeed } from '@/hooks/useFeed';
import { transformContributionToFeedEntry } from '@/types/contribution';
import type { FeedEntry } from '@/types/feed';
import { cn } from '@/utils/styles';

interface FundsReceivedTabProps {
  userId: number;
  authorId?: number;
}

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
    contributions,
    isLoading,
    error: contributionsError,
    hasMore,
    loadMore,
    isLoadingMore,
    restoredFeedEntries,
    restoredScrollPosition,
    lastClickedEntryId,
  } = useContributions({
    contribution_type: 'REVIEW',
    author_id: authorId,
    activeTab: 'peer-reviews',
  });

  const entries =
    restoredFeedEntries ||
    contributions
      .map((contribution) => {
        try {
          return transformContributionToFeedEntry({
            contribution,
            contributionType: 'REVIEW',
          });
        } catch (error) {
          console.error('[Contribution] Could not transform contribution', error);
          return null;
        }
      })
      .filter((entry): entry is FeedEntry => !!entry);

  if (contributionsError) {
    return (
      <p className="mt-4 text-sm text-red-600" role="alert">
        Error: {contributionsError.message}
      </p>
    );
  }

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
      activeTab="peer-reviews"
      restoredScrollPosition={restoredScrollPosition}
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

export function FundsReceivedTab({ userId, authorId }: Readonly<FundsReceivedTabProps>) {
  const router = useRouter();

  const browsePeerReviewBounties = () => {
    router.push(`/earn#${EARN_BOUNTIES_ANCHOR}`);
  };

  return (
    <div className="mb-6 space-y-8">
      <EarnEarningsSummary />
      <MyProposals userId={userId} />
      <EarnOpportunities onBrowse={browsePeerReviewBounties} />
      <PeerReviews authorId={authorId} />
    </div>
  );
}
