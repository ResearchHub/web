'use client';

import { useState, useEffect } from 'react';
import { LeaderboardService } from '@/services/leaderboard.service';
import { TopReviewer, TopFunder } from '@/types/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatRSC } from '@/utils/number';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

const LeaderboardListSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-[32px_40px_1fr_auto] gap-x-3 items-center px-1 py-2 rounded-md"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-12 justify-self-end" />
      </div>
    ))}
  </div>
);

// Skeleton Loader for leaderboard sections
export const LeaderboardSkeleton = () => (
  <>
    {/* Top Peer Reviewers Section Skeleton */}
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <div>
          <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
          <p className="text-xs text-gray-500">This Week</p>
        </div>
        <div className="text-xs text-gray-500">View All</div>
      </div>
      <LeaderboardListSkeleton />
    </div>

    {/* Divider */}
    <div className="border-t border-gray-200 my-4" />

    {/* Top Funders Section Skeleton */}
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <div>
          <h2 className="font-semibold text-gray-900">Top Funders</h2>
          <p className="text-xs text-gray-500">This Month</p>
        </div>
        <div className="text-xs text-gray-500">View All</div>
      </div>
      <LeaderboardListSkeleton />
    </div>
  </>
);

export const LeaderboardOverview = () => {
  const [reviewers, setReviewers] = useState<TopReviewer[]>([]);
  const [funders, setFunders] = useState<TopFunder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showUSD } = useCurrencyPreference();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await LeaderboardService.fetchLeaderboardOverview();
        // Limit to top 3 for display
        setReviewers(data.reviewers.slice(0, 3));
        setFunders(data.funders.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch leaderboard overview:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to render rank with icon
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative w-8 h-8 flex items-center justify-center">
          <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-2xl absolute" />
          <span className="relative text-gray-600 text-[11px] font-bold z-10">1</span>
        </div>
      );
    }
    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <span className="text-gray-600 text-sm font-semibold">{rank}</span>
      </div>
    );
  };

  const renderListItem = (
    item: TopReviewer | TopFunder,
    index: number,
    type: 'reviewer' | 'funder'
  ) => {
    const rank = index + 1;
    const authorId = item.authorProfile?.id;
    const amount =
      type === 'reviewer' ? (item as TopReviewer).earnedRsc : (item as TopFunder).totalFunding;

    const displayName = item.authorProfile.fullName;
    // Show gradient for long names, or shorter names if there's a verified badge (which takes up space)
    const needsGradient = displayName.length > 15 || (item.isVerified && displayName.length > 12);

    return (
      <div
        key={item.id}
        onClick={() => authorId && navigateToAuthorProfile(authorId)}
        className="grid grid-cols-[32px_40px_1fr_auto] gap-x-2 items-center hover:bg-gray-50 px-1 py-2 rounded-md cursor-pointer"
      >
        {/* Rank */}
        <div className="w-8 flex-shrink-0">{renderRank(rank)}</div>

        {/* Avatar */}
        <div className="w-10 flex-shrink-0 flex items-center">
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <Avatar
                src={item.authorProfile.profileImage}
                alt={item.authorProfile.fullName}
                size="sm"
                authorId={authorId}
              />
            </AuthorTooltip>
          ) : (
            <Avatar
              src={item.authorProfile.profileImage}
              alt={item.authorProfile.fullName}
              size="sm"
            />
          )}
        </div>

        {/* Name */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden mr-0.3">
          <div className="min-w-0 flex-shrink overflow-hidden relative">
            {authorId ? (
              <AuthorTooltip authorId={authorId}>
                <span className="text-sm font-medium text-gray-900 block whitespace-nowrap overflow-hidden">
                  {displayName}
                </span>
              </AuthorTooltip>
            ) : (
              <span className="text-sm font-medium text-gray-900 block whitespace-nowrap overflow-hidden">
                {displayName}
              </span>
            )}
            {needsGradient && (
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            )}
          </div>
          {item.isVerified && (
            <div className="flex-shrink-0">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>

        {/* RSC Badge */}
        <div className="flex-shrink-0 text-right">
          <CurrencyBadge
            amount={amount}
            variant="text"
            size="sm"
            currency={showUSD ? 'USD' : 'RSC'}
            shorten={true}
            showIcon={true}
            showText={showUSD}
            className="justify-end"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Peer Reviewers Section */}
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
          <Link href="/leaderboard?tab=reviewers" className="text-xs text-gray-500 hover:underline">
            View All
          </Link>
        </div>
        {isLoading ? (
          <LeaderboardListSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : reviewers.length > 0 ? (
          <div className="space-y-3">
            {reviewers.map((reviewer, index) => renderListItem(reviewer, index, 'reviewer'))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4 text-center">No reviewers found this week.</p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Top Funders Section */}
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Top Funders</h2>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
          <Link href="/leaderboard?tab=funders" className="text-xs text-gray-500 hover:underline">
            View All
          </Link>
        </div>
        {isLoading ? (
          <LeaderboardListSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : funders.length > 0 ? (
          <div className="space-y-3">
            {funders.map((funder, index) => renderListItem(funder, index, 'funder'))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4 text-center">No funders found this month.</p>
        )}
      </div>
    </>
  );
};
