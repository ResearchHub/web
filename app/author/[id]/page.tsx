'use client';

import { use, useTransition } from 'react';
import { useAuthorAchievements, useAuthorInfo, useAuthorSummaryStats } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/Card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useContributions } from '@/hooks/useContributions';
import { ContributionType } from '@/services/contribution.service';
import { transformContributionToFeedEntry } from '@/types/contribution';
import { FeedContent } from '@/components/Feed/FeedContent';
import Achievements, { AchievementsSkeleton } from './components/Achievements';
import KeyStats, { KeyStatsSkeleton } from './components/KeyStats';
import { SearchEmpty } from '@/components/ui/SearchEmpty';
import Moderation from './components/Moderation';
import { useAuthorPublications } from '@/hooks/usePublications';
import { transformPublicationToFeedEntry } from '@/types/publication';
import PinnedFundraise from './components/PinnedFundraise';
import { useOrcidCallback } from '@/components/Orcid/lib/hooks/useOrcidCallback';
import {
  ProfileHeroBanner,
  ProfileHeroBannerSkeleton,
} from '@/components/Author/ProfileHeroBanner';
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

// Add this mapping at the component level
const TAB_TO_CONTRIBUTION_TYPE: Record<string, ContributionType> = {
  contributions: 'ALL',
  publications: 'ARTICLE',
  'peer-reviews': 'REVIEW',
  comments: 'CONVERSATION',
  bounties: 'BOUNTY',
};

function AuthorTabs({ authorId, userId }: { authorId: number; userId?: number }) {
  const [isPending, startTransition] = useTransition();
  const tabs = [
    { id: 'contributions', label: 'Overview' },
    { id: 'publications', label: 'Publications' },
    { id: 'peer-reviews', label: 'Peer Reviews' },
    { id: 'comments', label: 'Comments' },
    { id: 'bounties', label: 'Bounties' },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'contributions';

  // Get the contribution type based on the current tab
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

  // Filter out reviews from comments tab
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

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', tabId);
      router.replace(`/author/${authorId}?${params.toString()}`, { scroll: false });
    });
  };

  const renderTabContent = () => {
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
        <div>
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
        </div>
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
        {/* Add PinnedFundraise as the first item in Overview tab */}
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
  };

  return (
    <div className="mt-8">
      <Tabs
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={handleTabChange}
        variant="primary"
        className="border-b"
      />
      <div className="mt-6">{renderTabContent()}</div>
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

  const topBanner = (() => {
    if (isLoading || isUserLoading) return <ProfileHeroBannerSkeleton />;
    if (error || userError || !user?.authorProfile) return undefined;
    return <ProfileHeroBanner author={user.authorProfile} refetchAuthorInfo={refetchAuthorInfo} />;
  })();

  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="mt-4 bg-gray-50">
            <h3 className="text-sm font-base uppercase text-gray-500 mb-3">Achievements</h3>
            <AchievementsSkeleton />
          </Card>
          <Card className="mt-4 bg-gray-50">
            <h3 className="text-sm font-base uppercase text-gray-500 mb-3">Key Stats</h3>
            <KeyStatsSkeleton />
          </Card>
        </div>
      );
    }

    if (error || userError) {
      return <AuthorProfileError error={error || userError?.message || 'Unknown error'} />;
    }

    if (!user || !user.authorProfile) {
      return <AuthorProfileError error="Author not found" />;
    }

    return (
      <>
        {(currentUser?.moderator || isHubEditor) && user.authorProfile?.userId && (
          <Card className="mt-4 bg-gray-50">
            <Moderation
              userId={user.authorProfile.userId.toString()}
              authorId={user.authorProfile.id}
              refetchAuthorInfo={refetchAuthorInfo}
            />
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="mt-4 bg-gray-50">
            <h3 className="text-sm font-base uppercase text-gray-500 mb-3">Achievements</h3>
            <Achievements achievements={achievements} isLoading={isAchievementsLoading} />
          </Card>
          {summaryStats && (
            <Card className="mt-4 bg-gray-50">
              <h3 className="text-sm font-base uppercase text-gray-500 mb-3">Key Stats</h3>
              <KeyStats
                summaryStats={summaryStats}
                profile={user}
                isLoading={isSummaryStatsLoading}
              />
            </Card>
          )}
        </div>
        <AuthorTabs authorId={user.authorProfile.id} userId={user.authorProfile.userId} />
      </>
    );
  };

  return (
    <PageLayout rightSidebar={null} topBanner={topBanner}>
      <div className="w-full">{renderContent()}</div>
    </PageLayout>
  );
}
