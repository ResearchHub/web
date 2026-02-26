'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useUser } from '@/contexts/UserContext';
import { LeaderboardListSkeleton } from './LeaderboardListSkeleton';
import { CurrentUserBanner } from './CurrentUserBanner';
import { LeaderboardListRow } from './LeaderboardListRow';
import { LeaderboardPagination } from './LeaderboardPagination';
import type { LeaderboardListItemBase } from './leaderboardList.types';
import { useLeaderboardReviewers } from '@/hooks/useLeaderboard';
import type { TopReviewer } from '@/types/leaderboard';
import { SearchEmpty } from '@/components/ui/SearchEmpty';
import { LoadErrorState } from '@/components/ui/LoadErrorState';

function toRowItem(reviewer: TopReviewer): LeaderboardListItemBase {
  return {
    id: reviewer.id,
    authorProfile: reviewer.authorProfile,
    isVerified: reviewer.isVerified,
    amount: reviewer.earnedRsc,
  };
}

interface TopPeerReviewersProps {
  period: string;
  page: number;
  onPageChange: (page: number) => void;
  currentUser: TopReviewer | null;
}

export function TopPeerReviewers({
  period,
  page,
  onPageChange,
  currentUser,
}: TopPeerReviewersProps) {
  const { showUSD } = useCurrencyPreference();
  const { user } = useUser();
  const currentUserAuthorId = user?.authorProfile?.id;
  const {
    state: {
      items: reviewers,
      isLoading,
      error,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    goToNextPage,
    goToPrevPage,
    pageSize,
    retry,
  } = useLeaderboardReviewers(period, page, onPageChange);

  const listStartRank = (currentPage - 1) * pageSize + 1;
  const isCurrentUserInList =
    currentUserAuthorId != null &&
    reviewers.some((r) => r.authorProfile?.id === currentUserAuthorId);
  const isCurrentUserAbove =
    currentUser != null &&
    !isCurrentUserInList &&
    currentUser.rank != null &&
    currentUser.rank < listStartRank;
  const isCurrentUserBelow = currentUser != null && !isCurrentUserInList && !isCurrentUserAbove;

  if (isLoading) {
    return <LeaderboardListSkeleton />;
  }

  if (error) {
    return (
      <LoadErrorState
        title={error}
        subtitle="We couldn't load the leaderboard. Please try again."
        onRetry={retry}
        className="py-10"
      />
    );
  }

  if (reviewers.length === 0) {
    return <SearchEmpty title="No results found" className="py-10" />;
  }

  const amountLabel = showUSD ? 'USD Earned' : 'RSC Earned';
  const currency = showUSD ? 'USD' : 'RSC';

  return (
    <>
      {isCurrentUserAbove && currentUser && (
        <div className="mb-4">
          <CurrentUserBanner
            currentUser={{
              id: currentUser.id,
              authorProfile: currentUser.authorProfile,
              isVerified: currentUser.isVerified,
              rank: currentUser.rank,
              amount: currentUser.earnedRsc,
            }}
            amountLabel={amountLabel}
            showUSD={showUSD}
            variant="row"
          />
        </div>
      )}

      <div className="space-y-2">
        {reviewers.map((reviewer, index) => {
          const rank = reviewer.rank ?? listStartRank + index;
          const isYou = reviewer.authorProfile?.id === currentUserAuthorId;
          return (
            <LeaderboardListRow
              key={reviewer.id}
              item={toRowItem(reviewer)}
              rank={rank}
              amountLabel={amountLabel}
              currency={currency}
              showUSD={showUSD}
              isHighlighted={isYou}
              showYouLabel={isYou}
            />
          );
        })}
      </div>

      {isCurrentUserBelow && currentUser && (
        <div className="mt-4">
          <CurrentUserBanner
            currentUser={{
              id: currentUser.id,
              authorProfile: currentUser.authorProfile,
              isVerified: currentUser.isVerified,
              rank: currentUser.rank,
              amount: currentUser.earnedRsc,
            }}
            amountLabel={amountLabel}
            showUSD={showUSD}
            variant="row"
          />
        </div>
      )}

      <LeaderboardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        onPrevPage={goToPrevPage}
        onNextPage={goToNextPage}
      />
    </>
  );
}
