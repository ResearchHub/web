'use client';

import { FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedItem } from '@/components/Feed/FeedItem';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { JournalFeedTabs } from '@/components/Feed/JournalFeedTabs';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useHub } from '@/hooks/useHub';
import { BookOpen } from 'lucide-react';

type JournalFeedTab = Extract<FeedTab, 'latest' | 'popular'>;

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

  if (hubError) {
    return (
      <PageLayout>
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600">Error loading journal: {hubError.message}</h2>
        </div>
      </PageLayout>
    );
  }

  if (!isHubLoading && !hub) {
    return (
      <PageLayout>
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600">Journal not found</h2>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pt-4 pb-7">
        <h2 className="text-xl text-gray-600 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Latest Research from {hub?.name}
        </h2>
      </div>

      <div className="max-w-4xl mx-auto">
        <JournalFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8 space-y-6">
          {isFeedLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
          ) : (
            entries.map((entry, index) => (
              <FeedItem key={entry.id} entry={entry} isFirst={index === 0} />
            ))
          )}
        </div>

        {!isFeedLoading && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
