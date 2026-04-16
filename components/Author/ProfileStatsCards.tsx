'use client';

import { Card } from '@/components/ui/Card';
import Achievements, { AchievementsSkeleton } from '@/app/author/[id]/components/Achievements';
import KeyStats, { KeyStatsSkeleton } from '@/app/author/[id]/components/KeyStats';
import { Achievement, AuthorSummaryStats } from '@/types/authorProfile';
import { User } from '@/types/user';

interface ProfileStatsCardsProps {
  user?: User | null;
  achievements: Achievement[];
  summaryStats: AuthorSummaryStats | null;
  isAchievementsLoading: boolean;
  isSummaryStatsLoading: boolean;
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-gray-50">
      <h3 className="text-sm font-base uppercase text-gray-500 mb-3">{title}</h3>
      {children}
    </Card>
  );
}

export function ProfileStatsCards({
  user,
  achievements,
  summaryStats,
  isAchievementsLoading,
  isSummaryStatsLoading,
}: ProfileStatsCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      <StatCard title="Achievements">
        <Achievements achievements={achievements} isLoading={isAchievementsLoading} />
      </StatCard>
      <StatCard title="Key Stats">
        {user && summaryStats ? (
          <KeyStats summaryStats={summaryStats} profile={user} isLoading={isSummaryStatsLoading} />
        ) : (
          <KeyStatsSkeleton />
        )}
      </StatCard>
    </div>
  );
}
