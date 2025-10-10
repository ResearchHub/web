'use client';

import { FC, useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles, Globe } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { FeedTabs } from './FeedTabs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { useUser } from '@/contexts/UserContext';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
  showSourceFilter?: boolean;
}

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData, showSourceFilter = true }) => {
  const { status } = useSession();
  const router = useRouter();
  const { user } = useUser();
  const isAuthenticated = status === 'authenticated';
  const isModerator = user?.isModerator || false;
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource>('all');
  const { entries, isLoading, hasMore, loadMore } = useFeed(defaultTab, {
    source: sourceFilter,
    initialData: initialFeedData,
  });

  // Sync the activeTab with the defaultTab when the component mounts or defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
    setIsNavigating(false);
  }, [defaultTab]);

  const handleTabChange = (tab: string) => {
    // Immediately update the active tab for visual feedback
    setActiveTab(tab as FeedTab);
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

  // Define the tabs for the feed
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
    <div className="space-y-4">
      {/* Banner removed */}

      <MainPageHeader
        icon={<Sparkles className="w-6 h-6 text-primary-500" />}
        title="Explore"
        subtitle="Discover trending research, earning, and funding opportunities"
      />
    </div>
  );

  const feedTabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={handleTabChange}
      isLoading={combinedIsLoading}
      isModerator={isModerator}
    />
  );

  const sourceFilters = showSourceFilter ? (
    <div className="flex justify-end">
      <div className="inline-flex items-center text-sm">
        <span className="text-gray-500 mr-2">View:</span>
        <button
          onClick={() => handleSourceFilterChange('all')}
          className={`transition-colors duration-200 px-1 flex items-center gap-1 ${
            sourceFilter === 'all'
              ? 'text-primary-600 font-medium'
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
              ? 'text-primary-600 font-medium'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Icon
            name="flaskVector"
            size={16}
            color={sourceFilter === 'researchhub' ? '#3971ff' : '#6b7280'}
          />
          ResearchHub
        </button>
      </div>
    </div>
  ) : null;

  return (
    <PageLayout>
      <FeedContent
        entries={entries}
        isLoading={combinedIsLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        tabs={feedTabs}
        activeTab={activeTab}
      />
    </PageLayout>
  );
};

export default Feed;
