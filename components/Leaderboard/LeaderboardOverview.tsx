'use client';

import { useEffect } from 'react';
import { TopReviewer, TopFunder } from '@/types/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { Star, ChevronRight } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';

const LeaderboardListSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2">
          <Star className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
        </div>
        <div className="text-xs text-gray-700 flex items-center gap-0.5 mt-1">
          View All
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
      <LeaderboardListSkeleton />
      <div className="mt-4 h-9 bg-gray-100 rounded-md w-full animate-pulse" />
    </div>

    {/* Divider */}
    <div className="border-t border-gray-200 my-4" />

    {/* Top Funders Section Skeleton */}
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2">
          <Icon name="fund" size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-gray-900">Top Funders</h2>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
        </div>
        <div className="text-xs text-gray-700 flex items-center gap-0.5 mt-1">
          View All
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
      <LeaderboardListSkeleton />
    </div>
  </>
);

export const LeaderboardOverview = () => {
  const { data, isLoading, error, fetchData } = useLeaderboard();
  const { showUSD } = useCurrencyPreference();

  const reviewers = data?.reviewers || [];
  const funders = data?.funders || [];

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
                <span className="text-sm font-medium text-gray-900 block overflow-hidden">
                  {displayName}
                </span>
              </AuthorTooltip>
            ) : (
              <span className="text-sm font-medium text-gray-900 block overflow-hidden">
                {displayName}
              </span>
            )}
            {needsGradient && (
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            )}
          </div>
          {item.isVerified && (
            <div className="flex-shrink-0 flex items-center">
              <VerifiedBadge size="sm" />
            </div>
          )}
        </div>

        {/* RSC Badge */}
        <div className="flex-shrink-0 text-right flex items-center">
          <CurrencyBadge
            amount={amount}
            variant="text"
            size="sm"
            currency={showUSD ? 'USD' : 'RSC'}
            shorten={true}
            showIcon={true}
            showText={showUSD}
            textColor="text-orange-500"
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
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </div>
          <Link
            href="/leaderboard?tab=reviewers"
            className="text-xs text-gray-700 hover:underline flex items-center gap-0.5 mt-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
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
        {/* Secondary CTA for preprints needing review */}
        <Link
          href="/earn"
          className="mt-4 block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 px-3 rounded-md border border-primary-200 hover:bg-primary-50 transition-colors"
        >
          View peer reviewing opportunities
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Top Funders Section */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-2">
            <Icon name="fund" size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900">Top Funders</h2>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
          <Link
            href="/leaderboard?tab=funders"
            className="text-xs text-gray-700 hover:underline flex items-center gap-0.5 mt-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
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
