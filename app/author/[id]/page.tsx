'use client';

import { use, useEffect, useState, useTransition } from 'react';
import { useAuthorInfo } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ActivityFeedList, ActivityRow } from '@/components/Activity';
import { groupActivityRows } from '@/components/Activity/lib/activityGrouping.utils';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { ModerationTab } from '@/components/profile/ModerationTab';
import { useOrcidCallback } from '@/components/Orcid/lib/hooks/useOrcidCallback';
import {
  ProfileHeroBanner,
  ProfileHeroBannerSkeleton,
} from '@/components/profile/ProfileHeroBanner';
import { PageLayout } from '@/app/layouts/PageLayout';
import type { AuthorProfile } from '@/types/authorProfile';

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

function AuthorActivityFeed({ author }: { author: AuthorProfile }) {
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
  } = useActivityFeed({ authorId: author.id });

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
        <ActivityRow key={row.key} row={row} profileAuthor={author} />
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

    return <AuthorActivityFeed author={author} />;
  };

  return (
    <PageLayout
      rightSidebar={false}
      topBanner={topBanner}
      className="sidebar-profile:max-w-[calc(100%-19.5rem)] lg:max-w-[calc(100%-21.5rem)]"
    >
      {renderMain()}
    </PageLayout>
  );
}
