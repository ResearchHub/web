'use client';

import { FC, useRef, useState, useEffect, Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles, Globe, FlaskConical, Microscope } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
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
      {/* New Feed Banner - Only visible to moderators */}
      {isModerator && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-500 rounded-md p-3">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">Try our new personalized feed!</h3>
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full uppercase">
                    Beta
                  </span>
                </div>
                <p className="text-sm text-blue-100">
                  Get cutting-edge research recommendations tailored to your interests
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/feed')}
              className="px-4 py-2 bg-white text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
            >
              Switch to New Feed
            </button>
          </div>
        </div>
      )}

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
      isCustomizing={isCustomizing}
      onTabChange={handleTabChange}
      onCustomizeChange={handleCustomizeChange}
      isLoading={combinedIsLoading}
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
      {!isCustomizing ? (
        <>
          <FeedContent
            entries={entries}
            isLoading={combinedIsLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            header={header}
            tabs={feedTabs}
            activeTab={activeTab}
          />
        </>
      ) : (
        <>
          {header}
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
