'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalFeedTabs } from '@/components/Feed/JournalFeedTabs';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useHub } from '@/hooks/useHub';
import { BookOpen } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';

type JournalFeedTab = Extract<FeedTab, 'latest'>;

export default function JournalFeedPage() {
  const { slug } = useParams();
  const decodedSlug = typeof slug === 'string' ? decodeURIComponent(slug) : null;
  const { hub, isLoading: isHubLoading, error: hubError } = useHub(decodedSlug);
  const [activeTab, setActiveTab] = useState<JournalFeedTab>('latest');
  const {
    entries,
    isLoading: isFeedLoading,
    hasMore,
    loadMore,
  } = useFeed(activeTab, {
    hubSlug: decodedSlug || '',
  });

  const isLoading = isHubLoading || isFeedLoading;

  if (isHubLoading) {
    return (
      <PageLayout>
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Loading journal...
          </h2>
        </div>
      </PageLayout>
    );
  }

  if (hubError || !hub) {
    return (
      <PageLayout>
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600">Journal not found</h2>
        </div>
      </PageLayout>
    );
  }

  const header = (
    <h2 className="text-xl text-gray-600 flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-indigo-500" />
      Latest Research from {hub.name}
    </h2>
  );

  const tabs = <JournalFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />;

  return (
    <PageLayout>
      <FeedContent
        entries={entries}
        isLoading={isFeedLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        tabs={tabs}
      />
    </PageLayout>
  );
}
