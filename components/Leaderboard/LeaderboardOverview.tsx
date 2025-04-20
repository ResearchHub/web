'use client';

import { useState, useEffect } from 'react';
import { LeaderboardService } from '@/services/leaderboard.service';
import { TopReviewer, TopFunder } from '@/types/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { RSCBadge } from '@/components/ui/RSCBadge';
import Link from 'next/link';

// Skeleton Loader for leaderboard sections
const LeaderboardSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-1">
        <div className="flex items-center gap-2">
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

  return (
    <div className="space-y-4">
      {/* Top Peer Reviewers Section */}
      <div className="mb-4 bg-white rounded-lg p-4 pl-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
          <span className="text-xs text-gray-500">This week</span>
        </div>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : reviewers.length > 0 ? (
          <div className="space-y-2">
            {reviewers.map((reviewer) => (
              <Link
                key={reviewer.id}
                href={reviewer.authorProfile.profileUrl}
                className="flex items-center justify-between hover:bg-gray-50 p-1 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    src={reviewer.authorProfile.profileImage}
                    alt={reviewer.authorProfile.fullName}
                    size="xs"
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {reviewer.authorProfile.fullName}
                  </span>
                </div>
                <RSCBadge
                  amount={reviewer.earnedRsc}
                  variant="text"
                  size="xs"
                  showExchangeRate={false}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No reviewers found this week.</p>
        )}
      </div>

      {/* Top Funders Section */}
      <div className="mb-4 bg-white rounded-lg p-4 pl-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Top Funders</h2>
          <span className="text-xs text-gray-500">This week</span>
        </div>
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : funders.length > 0 ? (
          <div className="space-y-2">
            {funders.map((funder) => (
              <Link
                key={funder.id}
                href={funder.authorProfile.profileUrl}
                className="flex items-center justify-between hover:bg-gray-50 p-1 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    src={funder.authorProfile.profileImage}
                    alt={funder.authorProfile.fullName}
                    size="xs"
                  />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {funder.authorProfile.fullName}
                  </span>
                </div>
                {/* Displaying total funding, consider formatting if needed */}
                <RSCBadge
                  amount={funder.totalFunding} // Using totalFunding here
                  variant="text"
                  size="xs"
                  showExchangeRate={false}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No funders found this week.</p>
        )}
      </div>
    </div>
  );
};
