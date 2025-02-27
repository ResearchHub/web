'use client';

import { FC, useState } from 'react';
import { FeedTabs } from './FeedTabs';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles } from 'lucide-react';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';

export const Feed: FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('following');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(activeTab);

  const header = (
    <h1 className="text-xl text-gray-600 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-indigo-500" />
      Discover the latest research, earning, and funding opportunities
    </h1>
  );

  const tabs = (
    <FeedTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={refresh}
      onCustomizeChange={setIsCustomizing}
      isLoading={isLoading}
    />
  );

  return (
    <PageLayout>
      {!isCustomizing ? (
        <FeedContent
          entries={entries}
          isLoading={isLoading}
          hasMore={hasMore}
          loadMore={loadMore}
          header={header}
          tabs={tabs}
        />
      ) : (
        <>
          <div className="pt-4 pb-7">{header}</div>
          <div className="max-w-4xl mx-auto">{tabs}</div>
        </>
      )}
    </PageLayout>
  );
};

export default Feed;
