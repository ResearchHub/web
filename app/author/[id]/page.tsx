'use client';

import { use, useTransition } from 'react';
import { useAuthorAchievements, useAuthorInfo, useAuthorSummaryStats } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { useContributions } from '@/hooks/useContributions';
import { ContributionType } from '@/services/contribution.service';
import { transformContributionToFeedEntry } from '@/types/contribution';
import { FeedContent } from '@/components/Feed/FeedContent';
import { SearchEmpty } from '@/components/ui/SearchEmpty';
import { ModerationTab } from '@/components/profile/ModerationTab';
import { ModerationPreview } from '@/components/profile/ModerationPreview';
import { ProfileStatsCards } from '@/components/profile/ProfileStatsCards';
import { OrcidSyncBanner } from '@/components/profile/OrcidSyncBanner';
import { useAuthorPublications } from '@/hooks/usePublications';
import { transformPublicationToFeedEntry } from '@/types/publication';
import PinnedFundraise from './components/PinnedFundraise';
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

const TAB_TO_CONTRIBUTION_TYPE: Record<string, ContributionType> = {
  contributions: 'ALL',
  publications: 'ARTICLE',
  'peer-reviews': 'REVIEW',
  comments: 'CONVERSATION',
  bounties: 'BOUNTY',
};

const AUTHOR_TABS = [
  { id: 'contributions', label: 'Overview' },
  { id: 'publications', label: 'Publications' },
  { id: 'peer-reviews', label: 'Peer Reviews' },
  { id: 'comments', label: 'Comments' },
  { id: 'bounties', label: 'Bounties' },
];

const MODERATION_TAB = {
  id: 'moderation',
  label: 'Moderation',
  icon: Shield,
  iconClassName: 'w-4 h-4',
};

function AuthorTabContent({
  authorId,
  userId,
  currentTab,
  isPending,
}: {
  authorId: number;
  userId?: number;
  currentTab: string;
  isPending: boolean;
}) {
  const contributionType = TAB_TO_CONTRIBUTION_TYPE[currentTab] || 'ALL';

  const {
    contributions: allContributions,
    isLoading: isContributionsLoading,
    error: contributionsError,
    hasMore: hasMoreContributions,
    loadMore: loadMoreContributions,
    isLoadingMore: isLoadingMoreContributions,
    restoredFeedEntries: restoredContributionsEntries,
    restoredScrollPosition: restoredContributionsScrollPosition,
    lastClickedEntryId: lastClickedContributionsEntryId,
  } = useContributions({
    contribution_type: contributionType,
    author_id: authorId,
    activeTab: currentTab,
  });

  const contributions =
    currentTab === 'comments'
      ? allContributions.filter((contribution) => !contribution.item?.review?.score)
      : allContributions;

  const {
    publications,
    isLoading: isPublicationsLoading,
    error: publicationsError,
    hasMore: hasMorePublications,
    loadMore: loadMorePublications,
    isLoadingMore: isLoadingMorePublications,
    restoredFeedEntries: restoredPublicationsEntries,
    restoredScrollPosition: restoredPublicationsScrollPosition,
    lastClickedEntryId: lastClickedPublicationsEntryId,
  } = useAuthorPublications({
    authorId,
    activeTab: currentTab,
  });

  if (currentTab === 'publications') {
    if (publicationsError) {
      return <div>Error: {publicationsError.message}</div>;
    }

    const entries =
      restoredPublicationsEntries ||
      publications
        .filter((publication) => {
          try {
            const entry = transformPublicationToFeedEntry(publication);
            return !!entry;
          } catch (error) {
            console.error('[Publication] Could not parse publication', error);
            return false;
          }
        })
        .map((publication) => transformPublicationToFeedEntry(publication));

    return (
      <FeedContent
        entries={isPending ? [] : entries}
        isLoading={isPending || isPublicationsLoading}
        hasMore={hasMorePublications}
        loadMore={loadMorePublications}
        showBountyFooter={false}
        hideActions={true}
        isLoadingMore={isLoadingMorePublications}
        noEntriesElement={<SearchEmpty title="No publications found." className="mb-10" />}
        maxLength={150}
        activeTab={currentTab}
        restoredScrollPosition={restoredPublicationsScrollPosition}
        lastClickedEntryId={lastClickedPublicationsEntryId ?? undefined}
        shouldRenderBountyAsComment={true}
      />
    );
  }

  if (contributionsError) {
    return <div>Error: {contributionsError.message}</div>;
  }

  const entries =
    restoredContributionsEntries ||
    contributions.map((contribution) =>
      transformContributionToFeedEntry({
        contribution,
        contributionType,
      })
    );

  return (
    <div>
      {currentTab === 'contributions' && userId && (
        <div className="mb-6">
          <PinnedFundraise userId={userId} compact={true} />
        </div>
      )}
      <FeedContent
        entries={isPending ? [] : entries}
        isLoading={isPending || isContributionsLoading}
        hasMore={hasMoreContributions}
        loadMore={loadMoreContributions}
        showBountyFooter={false}
        hideActions={true}
        isLoadingMore={isLoadingMoreContributions}
        noEntriesElement={
          <SearchEmpty title="No author activity found in this section." className="mb-10" />
        }
        maxLength={150}
        showReadMoreCTA={true}
        activeTab={currentTab}
        restoredScrollPosition={restoredContributionsScrollPosition}
        lastClickedEntryId={lastClickedContributionsEntryId ?? undefined}
        shouldRenderBountyAsComment={true}
      />
    </div>
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

  // Tab state — lifted here so the tab bar can live in the hero banner
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentTab = searchParams.get('tab') || 'contributions';

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', tabId);
      router.replace(`/author/${authorId}?${params.toString()}`, { scroll: false });
    });
  };

  const canModerate = !!(currentUser?.moderator || isHubEditor) && !!user?.authorProfile?.userId;
  const tabs = canModerate ? [...AUTHOR_TABS, MODERATION_TAB] : AUTHOR_TABS;

  const tabBar = (
    <Tabs tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} variant="primary" />
  );

  const topBanner = (() => {
    if (isLoading || isUserLoading) return <ProfileHeroBannerSkeleton tabBar={tabBar} />;
    if (error || userError || !user?.authorProfile) return undefined;
    return (
      <ProfileHeroBanner
        author={user.authorProfile}
        refetchAuthorInfo={refetchAuthorInfo}
        tabBar={tabBar}
      />
    );
  })();

  const profileLoading = isLoading || isUserLoading;
  const author = user?.authorProfile;
  const profileError = error || userError;
  const isOwnProfile = !!(
    currentUser?.authorProfile?.id && author?.id === currentUser.authorProfile.id
  );

  const sidebarContent = (
    <div className="flex flex-col gap-4">
      {author && (
        <OrcidSyncBanner isOwnProfile={isOwnProfile} isOrcidConnected={!!author.isOrcidConnected} />
      )}
      <div className="bg-gray-50/80 rounded-xl p-4 flex flex-col gap-6">
        {canModerate && author?.userId && <ModerationPreview userId={author.userId.toString()} />}
        <ProfileStatsCards
          user={user}
          achievements={achievements}
          summaryStats={summaryStats}
          isAchievementsLoading={profileLoading || isAchievementsLoading}
          isSummaryStatsLoading={profileLoading || isSummaryStatsLoading}
        />
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

    if (currentTab === 'moderation' && canModerate) {
      return (
        <ModerationTab
          userId={author.userId!.toString()}
          authorId={author.id}
          refetchAuthorInfo={refetchAuthorInfo}
        />
      );
    }

    return (
      <AuthorTabContent
        authorId={author.id}
        userId={author.userId}
        currentTab={currentTab}
        isPending={isPending}
      />
    );
  };

  return (
    <PageLayout rightSidebar={null} topBanner={topBanner} className="tablet:!max-w-full">
      <div className="flex flex-col sidebar-profile:flex-row gap-6 items-start">
        {!profileError && <div className="w-full sidebar-profile:hidden">{sidebarContent}</div>}
        <div className="flex-1 min-w-0 w-full">{renderMain()}</div>
        <aside className="hidden sidebar-profile:block w-72 lg:w-80 flex-shrink-0 sticky top-4">
          {!profileError && sidebarContent}
        </aside>
      </div>
    </PageLayout>
  );
}
