'use client';

import { useState, useEffect } from 'react';
import { LeaderboardService } from '@/services/leaderboard.service';
import { TopReviewer, TopFunder } from '@/types/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatRSC } from '@/utils/number';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { getLastWeekRange, formatDate } from '@/lib/dateUtils';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

// Skeleton Loader for leaderboard sections
const LeaderboardSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full mr-1"></div>
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    ))}
  </div>
);

export const LeaderboardOverview = () => {
  const [reviewers, setReviewers] = useState<TopReviewer[]>([]);
  const [funders, setFunders] = useState<TopFunder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showUSD } = useCurrencyPreference();

  // Get date range for current week
  const { start: startDate, end: endDate } = getLastWeekRange();
  const dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`;

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
        <span className="text-gray-600 text-[11px] font-semibold">{rank}</span>
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {/* Top Peer Reviewers Section */}
      <div className="mb-4 bg-white rounded-lg p-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-semibold text-gray-900 mb-2">Top Peer Reviewers</h2>
          <span className="text-xs text-gray-500">This Week</span>
        </div>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : reviewers.length > 0 ? (
          <>
            <div className="space-y-0">
              {reviewers.map((reviewer, index) => {
                const rank = index + 1;
                const authorId = reviewer.authorProfile?.id; // Get author ID safely
                return (
                  <div
                    key={reviewer.id}
                    onClick={() => authorId && navigateToAuthorProfile(authorId)}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md cursor-pointer"
                  >
                    {/* Fixed-width container for rank */}
                    <div className="w-8 flex-shrink-0">{renderRank(rank)}</div>

                    {/* Avatar with consistent sizing */}
                    <div className="w-10 flex-shrink-0 ml-2 ">
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <Avatar
                            src={reviewer.authorProfile.profileImage}
                            alt={reviewer.authorProfile.fullName}
                            size="sm"
                            authorId={authorId}
                          />
                        </AuthorTooltip>
                      ) : (
                        <Avatar
                          src={reviewer.authorProfile.profileImage}
                          alt={reviewer.authorProfile.fullName}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Name with flex-grow to push RSC badge to the right */}
                    <div className="flex-grow min-w-0 mr-1 -mt-1">
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <span className="text-xs font-medium text-gray-900 block break-words flex items-center gap-1">
                            {reviewer.authorProfile.fullName}
                            {(reviewer.authorProfile.isVerified ||
                              reviewer.authorProfile.user?.isVerified) && (
                              <VerifiedBadge size="xs" />
                            )}
                          </span>
                        </AuthorTooltip>
                      ) : (
                        <span className="text-xs font-medium text-gray-900 block break-words flex items-center gap-1">
                          {reviewer.authorProfile.fullName}
                          {(reviewer.authorProfile.isVerified ||
                            reviewer.authorProfile.user?.isVerified) && <VerifiedBadge size="xs" />}
                        </span>
                      )}
                    </div>

                    {/* RSC badge with fixed width */}
                    <div className="flex-shrink-0 w-16 text-right">
                      <CurrencyBadge
                        amount={reviewer.earnedRsc}
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
              })}
            </div>
            <div className="mt-2 text-center">
              <Link
                href="/leaderboard?tab=reviewers"
                className="text-xs text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">No reviewers found this week.</p>
        )}
      </div>

      {/* Top Funders Section */}
      <div className="mb-4 bg-white rounded-lg p-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-semibold text-gray-900  mb-2">Top Funders</h2>
          <span className="text-xs text-gray-500">This Week</span>
        </div>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : funders.length > 0 ? (
          <>
            <div className="space-y-0">
              {funders.map((funder, index) => {
                const rank = index + 1;
                const authorId = funder.authorProfile?.id; // Get author ID safely
                return (
                  <div
                    key={funder.id}
                    onClick={() => authorId && navigateToAuthorProfile(authorId)}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md cursor-pointer"
                  >
                    {/* Fixed-width container for rank */}
                    <div className="w-8 flex-shrink-0">{renderRank(rank)}</div>

                    {/* Avatar with consistent sizing */}
                    <div className="w-10 flex-shrink-0 ml-2 ">
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <Avatar
                            src={funder.authorProfile.profileImage}
                            alt={funder.authorProfile.fullName}
                            size="sm"
                            authorId={authorId}
                          />
                        </AuthorTooltip>
                      ) : (
                        <Avatar
                          src={funder.authorProfile.profileImage}
                          alt={funder.authorProfile.fullName}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Name with flex-grow to push RSC badge to the right */}
                    <div className="flex-grow min-w-0 mr-1 -mt-1">
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <span className="text-xs font-medium text-gray-900 block break-words flex items-center gap-1">
                            {funder.authorProfile.fullName}
                            {(funder.authorProfile.isVerified ||
                              funder.authorProfile.user?.isVerified) && <VerifiedBadge size="xs" />}
                          </span>
                        </AuthorTooltip>
                      ) : (
                        <span className="text-xs font-medium text-gray-900 block break-words flex items-center gap-1">
                          {funder.authorProfile.fullName}
                          {(funder.authorProfile.isVerified ||
                            funder.authorProfile.user?.isVerified) && <VerifiedBadge size="xs" />}
                        </span>
                      )}
                    </div>

                    {/* RSC badge with fixed width */}
                    <div className="flex-shrink-0 w-16 text-right">
                      <CurrencyBadge
                        amount={funder.totalFunding}
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
              })}
            </div>
            <div className="mt-2 text-center">
              <Link
                href="/leaderboard?tab=funders"
                className="text-xs text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">No funders found this week.</p>
        )}
      </div>
    </div>
  );
};
