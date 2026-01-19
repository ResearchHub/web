'use client';

import { FC, useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedContent } from './FeedContent';
import { FeedTabs, FeedSortOption } from './FeedTabs';
import { ForYouFeedBanner } from './ForYouFeedBanner';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';
import { useUser } from '@/contexts/UserContext';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isNavigating, setIsNavigating] = useState(false);

  const { tabs, activeTab, handleTabChange } = useFeedTabs(() => {
    setIsNavigating(true);
  });

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

    if (!orderingParam) {
      setOrdering(newOrdering);
    }
    setIsNavigating(false);
  }, [defaultTab, searchParams]);

  const handleSourceFilterChange = (source: FeedSource) => {
    setSourceFilter(source);
  };

  const handleSortChange = (sort: string) => {
    setOrdering(sort);
    // Update URL with new ordering
    const params = new URLSearchParams(searchParams.toString());
    params.set('ordering', sort);
    router.push(`/${activeTab}?${params.toString()}`, { scroll: false });
  };

  const combinedIsLoading = isLoading || isNavigating;

  const renderHeader = () => (
    <MainPageHeader
      icon={<FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#3971ff" />}
      title="Home"
      subtitle="Explore cutting-edge research from leading preprint servers."
      showTitle={false}
    />
  );

  const feedTabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={handleTabChange}
      isLoading={combinedIsLoading}
      showGearIcon={(activeTab === 'following' || activeTab === 'for-you') && !!user}
      onGearClick={() => setIsManageTopicsModalOpen(true)}
      showSorting={activeTab === 'following' && !!user}
      sortOption={(ordering as FeedSortOption) || 'hot_score_v2'}
      onSortChange={handleSortChange}
    />
  );

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
    <>
      <FeedContent
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        entries={entries}
        isLoading={combinedIsLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={renderHeader()}
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
    </>
  );
};

export default Feed;
