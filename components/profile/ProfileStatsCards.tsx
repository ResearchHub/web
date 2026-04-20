'use client';

import ProfileAchievements from '@/components/profile/ProfileAchievements';
import KeyStats, { KeyStatsSkeleton } from '@/app/author/[id]/components/KeyStats';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Achievement, AuthorSummaryStats } from '@/types/authorProfile';
import { User } from '@/types/user';

interface ProfileStatsCardsProps {
  user?: User | null;
  achievements: Achievement[];
  summaryStats: AuthorSummaryStats | null;
  isAchievementsLoading: boolean;
  isSummaryStatsLoading: boolean;
}

function hasAnyStats(summaryStats: AuthorSummaryStats | null, user?: User | null): boolean {
  if (!summaryStats) return false;
  const hIndex = user?.authorProfile?.hIndex ?? 0;
  const i10 = user?.authorProfile?.i10Index ?? 0;
  return (
    summaryStats.upvotesReceived > 0 ||
    summaryStats.worksCount > 0 ||
    summaryStats.citationCount > 0 ||
    summaryStats.amountFunded > 0 ||
    hIndex > 0 ||
    i10 > 0
  );
}

export function ProfileStatsCards({
  user,
  achievements,
  summaryStats,
  isAchievementsLoading,
  isSummaryStatsLoading,
}: ProfileStatsCardsProps) {
  const showAchievements = isAchievementsLoading || achievements.length > 0;
  const showStats = isSummaryStatsLoading || hasAnyStats(summaryStats, user);

  if (!showAchievements && !showStats) return null;

  return (
    <>
      {showAchievements && (
        <section>
          <SidebarHeader title="Achievements" />
          <ProfileAchievements achievements={achievements} isLoading={isAchievementsLoading} />
        </section>
      )}
      {showStats && (
        <section>
          <SidebarHeader title="Key Stats" />
          {user && summaryStats ? (
            <KeyStats
              summaryStats={summaryStats}
              profile={user}
              isLoading={isSummaryStatsLoading}
            />
          ) : (
            <KeyStatsSkeleton />
          )}
        </section>
      )}
    </>
  );
}
