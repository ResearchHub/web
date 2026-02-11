'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useUser } from '@/contexts/UserContext';
import { LeaderboardListSkeleton } from './LeaderboardListSkeleton';
import { CurrentUserBanner } from './CurrentUserBanner';
import { LeaderboardListRow } from './LeaderboardListRow';
import { LeaderboardPagination } from './LeaderboardPagination';
import type { LeaderboardListItemBase } from './leaderboardList.types';
import { useLeaderboardFunders } from '@/hooks/useLeaderboard';
import type { TopFunder } from '@/types/leaderboard';

function toRowItem(funder: TopFunder): LeaderboardListItemBase {
  return {
    id: funder.id,
    authorProfile: funder.authorProfile,
    isVerified: funder.isVerified,
    amount: funder.totalFunding,
  };
}

interface TopFundersProps {
  period: string;
  page: number;
  onPageChange: (page: number) => void;
  currentUser: TopFunder | null;
}

export function TopFunders({ period, page, onPageChange, currentUser }: TopFundersProps) {
  const { showUSD } = useCurrencyPreference();
  const { user } = useUser();
  const currentUserAuthorId = user?.authorProfile?.id;
  const {
    state: { items: funders, isLoading, error, currentPage, totalPages, hasNextPage, hasPrevPage },
    goToNextPage,
    goToPrevPage,
    pageSize,
  } = useLeaderboardFunders(period, page, onPageChange);

  const listStartRank = (currentPage - 1) * pageSize + 1;
  const isCurrentUserInList =
    currentUserAuthorId != null && funders.some((f) => f.authorProfile?.id === currentUserAuthorId);
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

  if (funders.length === 0) {
    return <p className="text-center text-gray-500 py-4">No funders found for this period.</p>;
  }

  const amountLabel = showUSD ? 'USD Funded' : 'RSC Funded';
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
              amount: currentUser.totalFunding,
            }}
            amountLabel={amountLabel}
            showUSD={showUSD}
            variant="row"
          />
        </div>
      )}

      <div className="space-y-2">
        {funders.map((funder, index) => {
          const rank = funder.rank ?? listStartRank + index;
          const isYou = funder.authorProfile?.id === currentUserAuthorId;
          return (
            <LeaderboardListRow
              key={funder.id}
              item={toRowItem(funder)}
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
              amount: currentUser.totalFunding,
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
