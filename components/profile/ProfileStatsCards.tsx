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

/**
 * Used in the tablet+ sidebar. Always renders both Achievements and Key Stats
 * sections, even when empty — the narrow mobile overview hides empty sections
 * separately via its own gating logic.
 */
export function ProfileStatsCards({
  user,
  achievements,
  summaryStats,
  isAchievementsLoading,
  isSummaryStatsLoading,
}: ProfileStatsCardsProps) {
  return (
    <>
      <section>
        <SidebarHeader title="Achievements" />
        <ProfileAchievements achievements={achievements} isLoading={isAchievementsLoading} />
      </section>
      <section>
        <SidebarHeader title="Key Stats" />
        {user && summaryStats ? (
          <KeyStats summaryStats={summaryStats} profile={user} isLoading={isSummaryStatsLoading} />
        ) : (
          <KeyStatsSkeleton />
        )}
      </section>
    </>
  );
}
