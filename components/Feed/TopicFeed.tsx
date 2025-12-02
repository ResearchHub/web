'use client';

import { FC, useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed, FeedTab } from '@/hooks/useFeed';
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
  const { hub, isLoading: isHubLoading, error: hubError } = useHub(decodedSlug);

  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);

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
    setActiveTab(defaultTab);
    setIsNavigating(false);
  }, [defaultTab]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      return;
    }

    setIsNavigating(true);

    const encodedSlug = decodedSlug ? encodeURIComponent(decodedSlug) : slug;
    router.push(`/topic/${encodedSlug}/${tab}`, { scroll: false });
  };

  const topicTabs = [
    {
      id: 'popular',
      label: 'Popular',
    },
    {
      id: 'latest',
      label: 'Latest',
    },
  ];

  if (!isHubLoading && (hubError || !hub)) {
    notFound();
  }

  // Combine loading states
  const isLoading = isHubLoading || isFeedLoading || isNavigating;

  const tabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={topicTabs}
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
