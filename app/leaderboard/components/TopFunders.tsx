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
import { SearchEmpty } from '@/components/ui/SearchEmpty';
import { LoadErrorState } from '@/components/ui/LoadErrorState';

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
    retry,
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
    return (
      <LoadErrorState
        title={error}
        subtitle="We couldn't load the leaderboard. Please try again."
        onRetry={retry}
        className="py-10"
      />
    );
  }

  if (funders.length === 0) {
    return <SearchEmpty title="No funders found for this period." className="py-10" />;
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
