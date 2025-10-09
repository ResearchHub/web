'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useHub } from '@/hooks/useHub';
import { Hash } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedTabs } from '@/components/Feed/FeedTabs';

export default function TopicFeedPage() {
  const params = useParams();
  const slug = params?.slug;
  const decodedSlug = typeof slug === 'string' ? decodeURIComponent(slug) : null;
  const { hub, isLoading: isHubLoading, error: hubError } = useHub(decodedSlug);
  const [activeTab, setActiveTab] = useState<FeedTab>('popular');
  const {
    entries,
    isLoading: isFeedLoading,
    hasMore,
    loadMore,
  } = useFeed(activeTab, {
    hubSlug: decodedSlug || '',
  });

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

  // Check for error state ONLY if not loading
  if (!isHubLoading && (hubError || !hub)) {
    return (
      <PageLayout>
        <div className="pt-4 pb-7">
          <h1 className="text-xl text-gray-600">Topic not found</h1>
        </div>
      </PageLayout>
    );
  }

  // Combine loading states
  const isLoading = isHubLoading || isFeedLoading;

  const tabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={topicTabs}
      onTabChange={(tab: string) => setActiveTab(tab as FeedTab)}
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
      />
    </PageLayout>
  );
}
