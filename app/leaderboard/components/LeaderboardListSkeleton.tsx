import { LEADERBOARD_PAGE_SIZE } from '@/services/leaderboard.service';

export const LeaderboardListSkeleton = () => (
  <div className="space-y-3 animate-pulse mt-4">
    {[...Array(LEADERBOARD_PAGE_SIZE)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="w-8 h-6 bg-gray-200 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-6 bg-gray-200 rounded w-36" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>
    ))}
  </div>
);
