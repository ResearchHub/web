'use client';

import { FC, useRef, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles } from 'lucide-react';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { FeedTabs } from './FeedTabs';
import { useSession } from 'next-auth/react';

interface FeedProps {
  defaultTab: FeedTab;
}

export const Feed: FC<FeedProps> = ({ defaultTab }) => {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(activeTab);

  const handleCustomizeChange = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleSaveComplete = () => {
    setIsCustomizing(false);
    refresh();
  };

  const tabs = [
    {
      id: 'popular',
      label: 'Popular',
    },
    ...(isAuthenticated
      ? [
          {
            id: 'following',
            label: 'Following',
          },
        ]
      : []),
    {
      id: 'latest',
      label: 'Latest',
    },
  ];

  const header = (
    <h1 className="text-xl text-gray-600 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-indigo-500" />
      Discover the latest research, earning, and funding opportunities
    </h1>
  );

  const feedTabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      isCustomizing={isCustomizing}
      onTabChange={setActiveTab}
      onCustomizeChange={handleCustomizeChange}
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
          tabs={feedTabs}
        />
      ) : (
        <>
          <div className="pt-4 pb-7">{header}</div>
          <div className="max-w-4xl mx-auto">
            {feedTabs}
            <div className="mt-6">
              <InterestSelector mode="preferences" onSaveComplete={handleSaveComplete} />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default Feed;
