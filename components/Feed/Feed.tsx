'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles, Globe } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { FeedTabs } from './FeedTabs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
}

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData }) => {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource>('all');
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(defaultTab, {
    source: sourceFilter,
    initialData: initialFeedData,
  });

  // Sync the activeTab with the defaultTab when the component mounts or defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
    setIsNavigating(false);
  }, [defaultTab]);

  const handleCustomizeChange = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleSaveComplete = () => {
    setIsCustomizing(false);
    refresh();
  };

  const handleTabChange = (tab: FeedTab) => {
    // Immediately update the active tab for visual feedback
    setActiveTab(tab);
    // Set navigating state to true to show loading state
    setIsNavigating(true);

    // Navigate to the appropriate URL
    if (tab === 'popular') {
      router.push('/');
    } else {
      router.push(`/${tab}`);
    }
  };

  const handleSourceFilterChange = (source: FeedSource) => {
    setSourceFilter(source);
    // The filter will be applied through the useFeed hook with the updated source option
  };

  // Combine the loading states
  const combinedIsLoading = isLoading || isNavigating;

  const tabs = [
    {
      id: 'popular',
      label: 'Trending',
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
      Discover trending research, earning, and funding opportunities
    </h1>
  );

  const feedTabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      isCustomizing={isCustomizing}
      onTabChange={handleTabChange}
      onCustomizeChange={handleCustomizeChange}
      isLoading={combinedIsLoading}
    />
  );

  const sourceFilters = (
    <div className="flex justify-end">
      <div className="inline-flex items-center text-sm">
        <span className="text-gray-500 mr-2">View:</span>
        <button
          onClick={() => handleSourceFilterChange('all')}
          className={`transition-colors duration-200 px-1 flex items-center gap-1 ${
            sourceFilter === 'all'
              ? 'text-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Globe size={16} />
          All
        </button>
        <span className="mx-2 text-gray-300">•</span>
        <button
          onClick={() => handleSourceFilterChange('researchhub')}
          className={`transition-colors duration-200 px-1 flex items-center gap-1 ${
            sourceFilter === 'researchhub'
              ? 'text-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Icon
            name="flaskVector"
            size={16}
            color={sourceFilter === 'researchhub' ? '#4f46e5' : '#6b7280'}
          />
          ResearchHub
        </button>
      </div>
    </div>
  );

  return (
    <PageLayout>
      {!isCustomizing ? (
        <FeedContent
          entries={entries}
          isLoading={combinedIsLoading}
          hasMore={hasMore}
          loadMore={loadMore}
          header={header}
          tabs={feedTabs}
          filters={sourceFilters}
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
