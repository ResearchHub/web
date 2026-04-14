'use client';

import { FC, useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useHub } from '@/hooks/useHub';
import { FeedContent } from '@/components/Feed/FeedContent';
import { DocumentFeedSortAndFilters } from '@/components/Feed/DocumentFeedSortAndFilters';

interface TopicFeedProps {
  defaultTab: FeedTab;
}

const getTopicOrdering = (tab: FeedTab): string | undefined => {
  if (tab === 'popular') return 'hot_score_v2';
  if (tab === 'latest') return 'latest';
  return undefined;
};

export const TopicFeed: FC<TopicFeedProps> = ({ defaultTab }) => {
  const params = useParams();
  const slug = params?.slug;
  const decodedSlug = typeof slug === 'string' ? decodeURIComponent(slug) : null;
  const [isNavigating, setIsNavigating] = useState(false);

  const { hub, isLoading: isHubLoading, error: hubError } = useHub(decodedSlug);

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

  const isLoading = isHubLoading || isFeedLoading || isNavigating;

  return (
    <PageLayout>
      {hub && <h1 className="sr-only">{hub.name}</h1>}
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        activeTab={defaultTab}
        filters={
          hub ? <DocumentFeedSortAndFilters variant="topic" topicName={hub.name} /> : undefined
        }
        ordering={getTopicOrdering(defaultTab)}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        lastClickedEntryId={lastClickedEntryId ?? undefined}
      />
    </PageLayout>
  );
};
