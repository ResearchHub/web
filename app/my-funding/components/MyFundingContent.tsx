'use client';

import { useEffect, useState } from 'react';
import { DraftCarousel } from '@/components/Funding/dashboard/DraftCarousel';
import { PeerReviewRows } from '@/components/Funding/dashboard/PeerReviewRows';
import { PublishedRows } from '@/components/Funding/dashboard/PublishedRows';
import { useMyFundingDocuments } from '@/components/Funding/dashboard/hooks/useMyFundingDocuments';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityCommentType } from '@/services/activity.service';
import { MyFundingDataError } from './MyFundingDataError';

/** Stable reference: a new array on every render would restart the activity feed. */
const PEER_REVIEW_COMMENT_TYPES: readonly ActivityCommentType[] = ['REVIEW', 'PEER_REVIEW'];

interface MyFundingContentProps {
  /** Whose page this is: the user, or the funder a moderator is viewing. */
  readonly viewedUserId: number;
  /** The user is looking at their own page, so everything they wrote belongs on it. */
  readonly isOwnPage: boolean;
  /** The user's author profile, whose activity and peer reviews the page reads. */
  readonly authorId?: number;
}

/**
 * The column of My Funding, under the stats: what the user has written,
 * whichever side of funding they are on. Drafts waiting to be picked back up
 * lead, as a row of cards; then what they published, RFPs and proposals
 * together; then their peer reviews. The activity rail lives beside this
 * column, as it does on an RFP page.
 */
export function MyFundingContent({ viewedUserId, isOwnPage, authorId }: MyFundingContentProps) {
  const { published, drafts, draftCount, isSettled, error, hasMore, loadMore } =
    useMyFundingDocuments({
      viewedUserId,
      isOwnPage,
    });

  const readsReviews = isOwnPage && authorId != null && authorId > 0;
  const reviews = useActivityFeed({
    authorId: readsReviews ? authorId : undefined,
    contentType: 'RHCOMMENTMODEL',
    commentTypes: PEER_REVIEW_COMMENT_TYPES,
    enabled: readsReviews,
  });
  const reviewEntries = readsReviews ? reviews.entries : [];

  // Once the feed pages, its count becomes the number of rows loaded, so the
  // total it first reported is the one kept.
  const [reviewTotal, setReviewTotal] = useState(0);
  useEffect(() => {
    setReviewTotal((total) => Math.max(total, reviews.count));
  }, [reviews.count]);

  if (!isSettled) return <ContentSkeleton />;

  return (
    <div className="mb-6 space-y-8">
      {error && <MyFundingDataError />}
      {drafts.length > 0 && (
        <DraftCarousel drafts={drafts} count={Math.max(draftCount, drafts.length)} />
      )}
      <PublishedRows
        documents={published}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyMessage={
          isOwnPage
            ? "You haven't published any RFPs or proposals yet."
            : "This funder hasn't published any RFPs yet."
        }
      />
      {reviewEntries.length > 0 && (
        <PeerReviewRows
          entries={reviewEntries}
          total={reviewTotal}
          hasMore={reviews.hasMore}
          isLoadingMore={reviews.isLoadingMore}
          loadMore={reviews.loadMore}
        />
      )}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li key={index} className="h-20 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </ul>
  );
}
