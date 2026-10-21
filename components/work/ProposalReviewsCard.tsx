'use client';

import { ReviewScoreStars } from '@/components/Activity/amounts/ReviewScoreStars';
import { Avatar } from '@/components/ui/Avatar';
import { CountBadge } from '@/components/ui/CountBadge';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { useShowProposalTab } from '@/components/work/lib/workTabs';
import type { Work } from '@/types/work';
import { formatTimeAgoShort } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';

/** Reviews shown in the card; the Reviews tab has them all. */
const MAX_SHOWN = 3;

/**
 * Who has reviewed the proposal, in its sidebar under the funding card: the
 * reviewer, their score and the review's opening line. Every row, and the
 * link under them, opens the Reviews tab.
 */
export function ProposalReviewsCard({ work }: { work: Work }) {
  const showTab = useShowProposalTab(work);

  const allReviews = work.peerReviews ?? [];
  const assessedReviews = allReviews.filter((review) => review.isAssessed);
  if (assessedReviews.length === 0) return null;

  const showReviews = () => showTab('reviews');

  return (
    <SidebarCard
      title={
        <>
          Reviewed by
          <CountBadge count={assessedReviews.length} />
        </>
      }
    >
      <ul className="-mx-2 mt-2 flex flex-col">
        {assessedReviews.slice(0, MAX_SHOWN).map((review) => {
          const reviewer = review.createdBy.authorProfile;
          return (
            <li key={review.id}>
              <button
                type="button"
                onClick={showReviews}
                className="flex w-full gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50"
              >
                <Avatar src={reviewer.profileImage} alt={reviewer.fullName} size={28} />
                <span className="min-w-0 flex-1 text-[13px] leading-[18px]">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-gray-900">
                      {reviewer.fullName}
                    </span>
                    <time
                      dateTime={review.createdDate}
                      suppressHydrationWarning
                      className="shrink-0 text-xs text-gray-500"
                    >
                      {formatTimeAgoShort(review.createdDate)}
                    </time>
                  </span>
                  <span className="mt-0.5 flex items-baseline gap-1.5 text-gray-600">
                    <ReviewScoreStars score={review.score} compact className="shrink-0" />
                    {review.contentPreview && (
                      <span className="line-clamp-2">“{review.contentPreview}”</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={showReviews}
        className="mt-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        Read all {allReviews.length} review{pluralizeSuffix(allReviews.length)}
      </button>
    </SidebarCard>
  );
}
