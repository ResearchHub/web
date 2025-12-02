'use client';

import { FC, useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles, Globe } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { FeedTabs } from './FeedTabs';
import { ForYouFeedBanner } from './ForYouFeedBanner';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { useUser } from '@/contexts/UserContext';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
  showSourceFilter?: boolean;
}

const getDefaultOrdering = (tab: FeedTab): string | undefined => {
  if (tab === 'popular') return undefined; // No ordering for trending feed
  if (tab === 'following') return 'hot_score_v2';
  if (tab === 'latest') return 'latest';
  if (tab === 'for-you') return undefined; // No sorting for personalized feed
  return undefined; // fallback
};

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData, showSourceFilter = true }) => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const isAuthenticated = status === 'authenticated';
  const isModerator = !!user?.isModerator;

  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource>('all');
  const orderingParam = searchParams.get('ordering');
  const filterParam = searchParams.get('filter');
  const userIdParam = searchParams.get('user_id');
  const [ordering, setOrdering] = useState<string | undefined>(
    orderingParam || getDefaultOrdering(defaultTab)
  );
  const [isManageTopicsModalOpen, setIsManageTopicsModalOpen] = useState(false);

  const isDebugMode = searchParams?.get('debug') !== null;

  const feedOptions = {
    source: sourceFilter,
    initialData: initialFeedData,
    isDebugMode,
    ordering,
    filter: filterParam || undefined,
    userId: userIdParam || undefined,
  };

  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed(defaultTab, feedOptions);

  useEffect(() => {
    const orderingParam = searchParams.get('ordering');
    const newOrdering = !orderingParam ? getDefaultOrdering(defaultTab) : ordering;

    setActiveTab(defaultTab);
    if (!orderingParam) {
      setOrdering(newOrdering);
    }
    setIsNavigating(false);
  }, [defaultTab, searchParams]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) {
      return;
    }

    setIsNavigating(true);

    const params = new URLSearchParams();
    const orderingParam = searchParams.get('ordering');
    if (orderingParam) {
      params.set('ordering', orderingParam);
    }
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      params.set('filter', filterParam);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';

    if (tab === 'popular') {
      router.push(`/trending${queryString}`);
    } else {
      router.push(`/${tab}${queryString}`);
    }
  };

  const handleSourceFilterChange = (source: FeedSource) => {
    setSourceFilter(source);
  };

  const combinedIsLoading = isLoading || isNavigating;

  const tabs = [
    {
      id: 'popular',
      label: 'Trending',
    },
    ...(isAuthenticated || isModerator || isDebugMode
      ? [
          {
            id: 'for-you',
            label: 'For You',
          },
        ]
      : []),
    ...(isAuthenticated
      ? [
          {
            id: 'following',
            label: 'Following',
          },
        ]
      : []),
  ];

  const header = (
    <div className="space-y-4">
      <MainPageHeader
        icon={<Sparkles className="w-6 h-6 text-primary-500" />}
        title="Explore"
        subtitle="Discover trending research, earning, and funding opportunities"
      />
    </div>
  );

  // Hide tabs for logged out users on main feed routes
  const shouldShowTabs =
    isAuthenticated || !['popular', 'for-you', 'following'].includes(defaultTab);

  const feedTabs = shouldShowTabs ? (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={handleTabChange}
      isLoading={combinedIsLoading}
      showGearIcon={activeTab === 'following'}
      onGearClick={() => setIsManageTopicsModalOpen(true)}
    />
  ) : null;

  // Show ForYouFeedBanner when on "for-you" tab
  const banner = activeTab === 'for-you' ? <ForYouFeedBanner /> : undefined;

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
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        entries={entries}
        isLoading={combinedIsLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        tabs={feedTabs}
        banner={banner}
        activeTab={activeTab}
        ordering={ordering}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        lastClickedEntryId={lastClickedEntryId ?? undefined}
      />
      <ManageTopicsModal
        isOpen={isManageTopicsModalOpen}
        onClose={() => setIsManageTopicsModalOpen(false)}
        onTopicsChanged={refresh}
      />
    </PageLayout>
  );
};

export default Feed;
