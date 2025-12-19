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
import AuthorProfile from './components/AuthorProfile';
import { useAuthorPublications } from '@/hooks/usePublications';
import { transformPublicationToFeedEntry } from '@/types/publication';
import PinnedFundraise from './components/PinnedFundraise';
import { OrcidSyncBanner } from '@/components/Orcid/OrcidSyncBanner';
import { useOrcidCallback } from '@/components/Orcid/lib/hooks/useOrcidCallback';
function toNumberOrNull(value: any): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function AuthorProfileSkeleton() {
  return (
    <div className="flex flex-col sm:!flex-row gap-6 animate-pulse">
      {/* Left column - Avatar */}
      <div className="flex-shrink-0 flex justify-between items-start w-full sm:!w-auto">
        <div className="mx-auto sm:mx-0">
          <div className="w-32 h-32 bg-gray-200 rounded-full ring-4 ring-white" />
        </div>
      </div>

      {/* Right column - Content */}
      <div className="flex flex-col flex-1 min-w-0 gap-4">
        {/* Header with name and edit button */}
        <div className="flex flex-col sm:!flex-row justify-between items-start gap-4">
          <div className="flex flex-col items-start gap-2">
            <div className="h-9 bg-gray-200 rounded w-48" />
            <div className="h-5 bg-gray-200 rounded w-40" />
          </div>
        </div>
        {/* Education */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded w-64" />
        </div>
        {/* Member since */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        {/* Description */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        {/* Social Icons */}
        <div className="flex gap-2 mt-2">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
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
  const [{ achievements, isLoading: isAchievementsLoading, error: achievementsError }] =
    useAuthorAchievements(authorId);
  const [{ summaryStats, isLoading: isSummaryStatsLoading, error: summaryStatsError }] =
    useAuthorSummaryStats(authorId);

  if (isLoading || isUserLoading) {
    return (
      <>
        <Card className="mt-4 bg-gray-50">
          <AuthorProfileSkeleton />
        </Card>
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
      </>
    );
  }

  if (error || userError) {
    return <AuthorProfileError error={error || userError?.message || 'Unknown error'} />;
  }

  if (!user || !user.authorProfile) {
    return <AuthorProfileError error="Author not found" />;
  }

  const isOwnProfile = Boolean(
    currentUser?.authorProfile?.id && user.authorProfile.id === currentUser.authorProfile.id
  );
  const isOrcidConnected = Boolean(currentUser?.authorProfile?.isOrcidConnected);

  return (
    <>
      <OrcidSyncBanner isOwnProfile={isOwnProfile} isOrcidConnected={isOrcidConnected} />
      <Card className="mt-4 bg-gray-50">
        <AuthorProfile author={user.authorProfile} refetchAuthorInfo={refetchAuthorInfo} />
      </Card>
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
}
