'use client';

import { FC, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles } from 'lucide-react';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

export const Feed: FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('following');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(activeTab);
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as FeedTab);
  };

  const handleCustomizeClick = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleSaveComplete = () => {
    setIsCustomizing(false);
    refresh();
  };

  const tabs = [
    {
      id: 'following',
      label: 'Following',
    },
    {
      id: 'latest',
      label: 'Latest',
    },
    {
      id: 'popular',
      label: 'Popular',
    },
  ];

  const header = (
    <h1 className="text-xl text-gray-600 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-indigo-500" />
      Discover the latest research, earning, and funding opportunities
    </h1>
  );

  const feedTabs = (
    <div>
      <div className="flex items-center justify-between">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />
        <Button
          variant={isCustomizing ? 'default' : 'ghost'}
          size="sm"
          onClick={() => executeAuthenticatedAction(handleCustomizeClick)}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Settings className="w-5 h-5" />
          Customize
        </Button>
      </div>
    </div>
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
