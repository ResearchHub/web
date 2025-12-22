'use client';

import { FC, useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { useHub } from '@/hooks/useHub';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedTabs } from '@/components/Feed/FeedTabs';

interface TopicFeedProps {
  defaultTab: FeedTab;
}

// Get the default ordering for topic feed tabs
const getTopicOrdering = (tab: FeedTab): string | undefined => {
  if (tab === 'popular') return 'hot_score_v2';
  if (tab === 'latest') return 'latest';
  return undefined;
};

export const TopicFeed: FC<TopicFeedProps> = ({ defaultTab }) => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const decodedSlug = typeof slug === 'string' ? decodeURIComponent(slug) : null;
  const [isNavigating, setIsNavigating] = useState(false);

  const { hub, isLoading: isHubLoading, error: hubError } = useHub(decodedSlug);
  const {
    tabs: feedTabsList,
    activeTab,
    handleTabChange,
  } = useFeedTabs(() => setIsNavigating(true));

  const {
    entries,
    isLoading: isFeedLoading,
    hasMore,
    loadMore,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed(defaultTab, {
    hubSlug: decodedSlug || '',
    ordering: getTopicOrdering(defaultTab),
  });

  useEffect(() => {
    setIsNavigating(false);
  }, [defaultTab]);

  if (!isHubLoading && (hubError || !hub)) {
    notFound();
  }

  // Combine loading states
  const isLoading = isHubLoading || isFeedLoading || isNavigating;

  const tabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={feedTabsList}
      onTabChange={handleTabChange}
      isLoading={isLoading}
    />
  );

  return (
    <PageLayout>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        tabs={tabs}
        activeTab={activeTab}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        lastClickedEntryId={lastClickedEntryId ?? undefined}
      />
    </PageLayout>
  );
};
