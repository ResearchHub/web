'use client';

import { FC, useState } from 'react';
import { FeedTabs } from './FeedTabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedItem } from './FeedItem';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { Sparkles } from 'lucide-react';
import { useFeed, FeedTab } from '@/hooks/useFeed';

export const Feed: FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(activeTab);

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pt-4 pb-7">
          <h2 className="text-xl text-gray-600 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Discover the latest research, earning, and funding opportunities
          </h2>
        </div>

        <div className="border-b border-gray-100">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} onRefresh={refresh} />
        </div>

        <div className="mt-8 space-y-6">
          {isLoading ? (
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

        {!isLoading && hasMore && (
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
};

export default Feed;
