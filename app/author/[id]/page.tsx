'use client';

import { use, useEffect, useState, useTransition } from 'react';
import { useAuthorAchievements, useAuthorInfo, useAuthorSummaryStats } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ActivityFeedList, ActivityRow } from '@/components/Activity';
import { groupActivityRows } from '@/components/Activity/lib/activityGrouping.utils';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { ModerationTab } from '@/components/profile/ModerationTab';
import { ModerationPreview } from '@/components/profile/ModerationPreview';
import { ProfileStatsCards } from '@/components/profile/ProfileStatsCards';
import { ProfileStatsStrip } from '@/components/profile/ProfileStatsStrip';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import { OrcidSyncBanner } from '@/components/profile/OrcidSyncBanner';
import { useOrcidCallback } from '@/components/Orcid/lib/hooks/useOrcidCallback';
import {
  ProfileHeroBanner,
  ProfileHeroBannerSkeleton,
} from '@/components/profile/ProfileHeroBanner';
import { PageLayout } from '@/app/layouts/PageLayout';

function toNumberOrNull(value: any): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function AuthorProfileError({ error }: { error: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-500 text-lg mb-4">Error loading profile</div>
      <div className="text-gray-600">{error}</div>
    </div>
  );
}

type AuthorTab = 'overview' | 'moderation';

const OVERVIEW_TAB = { id: 'overview', label: 'Overview' };

const MODERATION_TAB = {
  id: 'moderation',
  label: 'Moderation',
  icon: Shield,
  iconClassName: 'w-4 h-4',
};

/** Overview answers to its legacy `contributions` token so existing links stay valid. */
function resolveAuthorTab(tab: string): AuthorTab {
  return tab === 'moderation' ? 'moderation' : 'overview';
}

function AuthorActivityFeed({ authorId }: { authorId: number }) {
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    feedKey,
    restoredScrollPosition,
    lastClickedEntryId,
  } = useActivityFeed({ authorId });

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId: lastClickedEntryId ?? undefined,
  });

  const rows = groupActivityRows(entries);

  return (
    <ActivityFeedList
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      isEmpty={entries.length === 0}
    >
      {rows.map((row) => (
        <ActivityRow key={row.key} row={row} />
      ))}
    </ActivityFeedList>
  );
}

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: currentUser, isLoading: isUserLoading, error: userError, refreshUser } = useUser();
  const authorId = toNumberOrNull(resolvedParams.id);
  const [{ author: user, isLoading, error }, refetchAuthorInfo] = useAuthorInfo(authorId);
  useOrcidCallback({ onSuccess: refreshUser });
  const isHubEditor = !!currentUser?.authorProfile?.isHubEditor;
  const [{ achievements, isLoading: isAchievementsLoading }] = useAuthorAchievements(authorId);
  const [{ summaryStats, isLoading: isSummaryStatsLoading }] = useAuthorSummaryStats(authorId);

  // Tab state â€” lifted here so the tab bar can live in the hero banner
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const urlTab = searchParams.get('tab') || 'contributions';
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    if (pendingTab === urlTab) {
      setPendingTab(null);
    }
  }, [urlTab, pendingTab]);

  const activeTab = resolveAuthorTab(pendingTab ?? urlTab);

  const changeTab = (tabId: string) => {
    const nextTab = tabId === 'moderation' ? 'moderation' : 'contributions';
    setPendingTab(nextTab);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', nextTab);
      router.replace(`/author/${authorId}?${params.toString()}`, { scroll: false });
    });
  };

  const canModerate = !!(currentUser?.moderator || isHubEditor) && !!user?.authorProfile?.userId;
  const isOwnProfile = !!(
    currentUser?.authorProfile?.id && user?.authorProfile?.id === currentUser.authorProfile.id
  );
  const tabs = canModerate ? [OVERVIEW_TAB, MODERATION_TAB] : [OVERVIEW_TAB];

  const tabsReady = !isLoading && !isUserLoading && !!user?.authorProfile;
  const tabBar = tabsReady ? (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={changeTab} variant="primary" />
  ) : undefined;

  const profileLoading = isLoading || isUserLoading;

  const topBanner = (() => {
    if (profileLoading) {
      return <ProfileHeroBannerSkeleton tabCount={1} />;
    }
    if (error || userError || !user?.authorProfile) return undefined;
    return (
      <ProfileHeroBanner
        author={user.authorProfile}
        refetchAuthorInfo={refetchAuthorInfo}
        tabBar={tabBar}
      />
    );
  })();

  const author = user?.authorProfile;
  const profileError = error || userError;

  const sidebarContent = (
    <div className="flex flex-col gap-4">
      {author && (
        <OrcidSyncBanner isOwnProfile={isOwnProfile} isOrcidConnected={!!author.isOrcidConnected} />
      )}
      <div className="bg-gray-50/80 rounded-xl p-4 flex flex-col gap-6">
        {canModerate && author?.userId && <ModerationPreview userId={author.userId.toString()} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 sidebar-profile:grid-cols-1 gap-6">
          <ProfileStatsCards
            user={user}
            achievements={achievements}
            summaryStats={summaryStats}
            isAchievementsLoading={profileLoading || isAchievementsLoading}
            isSummaryStatsLoading={profileLoading || isSummaryStatsLoading}
          />
        </div>
      </div>
    </div>
  );

  const renderMain = () => {
    if (profileError) {
      const message = error || userError?.message || 'Unknown error';
      return <AuthorProfileError error={message} />;
    }
    if (!profileLoading && !author) {
      return <AuthorProfileError error="Author not found" />;
    }
    if (!author) return null;

    if (activeTab === 'moderation' && canModerate) {
      return (
        <ModerationTab
          userId={author.userId!.toString()}
          authorId={author.id}
          refetchAuthorInfo={refetchAuthorInfo}
        />
      );
    }

    return <AuthorActivityFeed authorId={author.id} />;
  };

  // Compact mobile header shown inside the Overview tab only, to avoid filler
  // space on the Moderation tab at narrow widths. Tablet+ uses the full `sidebarContent`.
  const hasAnyStats =
    !!summaryStats &&
    (summaryStats.worksCount > 0 ||
      summaryStats.citationCount > 0 ||
      summaryStats.amountFunded > 0 ||
      (user?.authorProfile?.hIndex ?? 0) > 0 ||
      (user?.authorProfile?.i10Index ?? 0) > 0);
  const mobileOverviewHeader = !profileError && author && (
    <div className="tablet:hidden flex flex-col gap-4 mb-4">
      <OrcidSyncBanner isOwnProfile={isOwnProfile} isOrcidConnected={!!author.isOrcidConnected} />
      {canModerate && author.userId && <ModerationPreview userId={author.userId.toString()} />}
      {hasAnyStats && summaryStats && user && (
        <section>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Stats</h3>
          <div className="rounded-lg border border-gray-200 p-4">
            <ProfileStatsStrip summaryStats={summaryStats} profile={user} />
          </div>
        </section>
      )}
      {achievements.length > 0 && (
        <section>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Achievements</h3>
          <div className="rounded-lg border border-gray-200 p-4">
            <ProfileAchievements achievements={achievements} isLoading={false} />
          </div>
        </section>
      )}
    </div>
  );

  return (
    <PageLayout rightSidebar={null} topBanner={topBanner} className="tablet:!max-w-full">
      <div className="flex flex-col sidebar-profile:flex-row gap-6 items-start">
        {!profileError && (
          <div className="w-full hidden tablet:block sidebar-profile:hidden">{sidebarContent}</div>
        )}
        <div className="flex-1 min-w-0 w-full">
          {activeTab === 'overview' && mobileOverviewHeader}
          {renderMain()}
        </div>
        <aside className="hidden sidebar-profile:block w-72 lg:w-80 flex-shrink-0 sticky top-4">
          {!profileError && sidebarContent}
        </aside>
      </div>
    </PageLayout>
  );
}
