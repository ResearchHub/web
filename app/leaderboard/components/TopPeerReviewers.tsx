'use client';

import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useUser } from '@/contexts/UserContext';
import { LeaderboardListSkeleton } from './LeaderboardListSkeleton';
import { CurrentUserBanner } from './CurrentUserBanner';
import { useLeaderboardReviewers } from '@/hooks/useLeaderboard';
import type { TopReviewer } from '@/types/leaderboard';
import { cn } from '@/utils/styles';

function renderRank(rank: number) {
  if (rank === 1) {
    return (
      <div className="relative w-8 h-6 flex items-center justify-center">
        <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-2xl absolute" />
        <span className="relative text-gray-700 text-xs font-bold z-10">1</span>
      </div>
    );
  }
  return <span className="font-semibold text-base w-8 text-center text-gray-500">{rank}</span>;
}

function ReviewerRow({
  reviewer,
  rank,
  showUSD,
  isHighlighted,
  showYouLabel,
}: {
  reviewer: TopReviewer;
  rank: number;
  showUSD: boolean;
  isHighlighted: boolean;
  showYouLabel?: boolean;
}) {
  const authorId = reviewer.authorProfile?.id;
  return (
    <div
      key={reviewer.id}
      onClick={() =>
        reviewer.authorProfile?.id && navigateToAuthorProfile(reviewer.authorProfile.id)
      }
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border cursor-pointer',
        isHighlighted ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'hover:bg-gray-100'
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {renderRank(rank)}
        {authorId ? (
          <AuthorTooltip authorId={authorId}>
            <Avatar
              src={reviewer.authorProfile.profileImage}
              alt={reviewer.authorProfile.fullName}
              size="md"
              authorId={authorId}
            />
          </AuthorTooltip>
        ) : (
          <Avatar
            src={reviewer.authorProfile.profileImage}
            alt={reviewer.authorProfile.fullName}
            size="md"
          />
        )}
        <div className="flex flex-col min-w-0">
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-900 truncate">
                  {reviewer.authorProfile.fullName}
                  {showYouLabel && <span className="text-orange-600 font-medium"> (you)</span>}
                </span>
                {reviewer.isVerified && <VerifiedBadge size="sm" />}
              </div>
            </AuthorTooltip>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-gray-900 truncate">
                {reviewer.authorProfile.fullName}
                {showYouLabel && <span className="text-orange-600 font-medium"> (you)</span>}
              </span>
              {reviewer.isVerified && <VerifiedBadge size="sm" />}
            </div>
          )}
          {reviewer.authorProfile.headline && (
            <span className="text-sm text-gray-500 line-clamp-2">
              {reviewer.authorProfile.headline}
            </span>
          )}
          <div className="block sm:!hidden">
            <CurrencyBadge
              amount={reviewer.earnedRsc}
              variant="text"
              size="md"
              label={showUSD ? 'USD Earned' : 'RSC Earned'}
              currency={showUSD ? 'USD' : 'RSC'}
              textColor="text-gray-700"
              currencyLabelColor="text-gray-500"
              showIcon={true}
              showText={false}
              className="px-0"
            />
          </div>
        </div>
      </div>
      <div className="hidden sm:!block">
        <CurrencyBadge
          amount={reviewer.earnedRsc}
          variant="text"
          size="md"
          label={showUSD ? 'USD Earned' : 'RSC Earned'}
          currency={showUSD ? 'USD' : 'RSC'}
          textColor="text-gray-700"
          currencyLabelColor="text-gray-500"
          showIcon={true}
          showText={false}
        />
      </div>
    </div>
  );
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
    return <p className="text-center text-red-600 py-4">{error}</p>;
  }

  if (reviewers.length === 0) {
    return <p className="text-center text-gray-500 py-4">No reviewers found for this period.</p>;
  }

  return (
    <>
      {isCurrentUserAbove && (
        <div className="mb-4">
          <CurrentUserBanner
            currentUser={{
              id: currentUser.id,
              authorProfile: currentUser.authorProfile,
              isVerified: currentUser.isVerified,
              rank: currentUser.rank,
              amount: currentUser.earnedRsc,
            }}
            amountLabel={showUSD ? 'USD Earned' : 'RSC Earned'}
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
            <ReviewerRow
              key={reviewer.id}
              reviewer={reviewer}
              rank={rank}
              showUSD={showUSD}
              isHighlighted={isYou}
              showYouLabel={isYou}
            />
          );
        })}
      </div>

      {isCurrentUserBelow && (
        <div className="mt-4">
          <CurrentUserBanner
            currentUser={{
              id: currentUser.id,
              authorProfile: currentUser.authorProfile,
              isVerified: currentUser.isVerified,
              rank: currentUser.rank,
              amount: currentUser.earnedRsc,
            }}
            amountLabel={showUSD ? 'USD Earned' : 'RSC Earned'}
            showUSD={showUSD}
            variant="row"
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 px-0 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPrevPage()}
              disabled={!hasPrevPage || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToNextPage()}
              disabled={!hasNextPage || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
