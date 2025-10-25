'use client';

import { FC, useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles, Globe } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { FeedTabs } from './FeedTabs';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { useUser } from '@/contexts/UserContext';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';
import { getExperimentVariant, Experiment, ExperimentVariant } from '@/utils/experiment';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
  showSourceFilter?: boolean;
}

// Helper function to determine default ordering based on tab
const getDefaultOrdering = (tab: FeedTab, experimentVariant?: ExperimentVariant): string => {
  // A/B test for following feed ordering
  if (tab === 'following' && experimentVariant === ExperimentVariant.B) {
    return 'latest';
  }

  if (tab === 'popular' || tab === 'following') return 'hot_score';
  if (tab === 'latest') return 'latest';
  return 'hot_score'; // fallback
};

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData, showSourceFilter = true }) => {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const isAuthenticated = status === 'authenticated';

  // Get experiment variant for following feed ordering
  const followingFeedExperiment = getExperimentVariant(Experiment.FollowingFeedOrdering, user?.id);

  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource>('all');
  const orderingParam = searchParams.get('ordering');
  const [ordering, setOrdering] = useState<string>(
    orderingParam || getDefaultOrdering(defaultTab, followingFeedExperiment)
  );
  const [isManageTopicsModalOpen, setIsManageTopicsModalOpen] = useState(false);
  const hotScoreVersion =
    (searchParams.get('hot_score_version') as 'v1' | 'v2') ||
    (defaultTab === 'following' ? 'v2' : 'v1'); // Always use v2 for following feed (experiment uses v2 for both variants)
  const isDebugMode = searchParams?.get('debug') !== null;
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(defaultTab, {
    source: sourceFilter,
    initialData: initialFeedData,
    hotScoreVersion,
    includeHotScoreBreakdown: isDebugMode,
    ordering,
  });

  // Sync the activeTab with the defaultTab when the component mounts or defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
    // Only update ordering if there's no query param override
    const orderingParam = searchParams.get('ordering');
    if (!orderingParam) {
      setOrdering(getDefaultOrdering(defaultTab, followingFeedExperiment));
    }
    setIsNavigating(false);
  }, [defaultTab, searchParams, followingFeedExperiment]);

  const handleTabChange = (tab: string) => {
    // Don't navigate if clicking the already active tab
    if (tab === activeTab) {
      return;
    }

    // Immediately update the active tab for visual feedback
    setActiveTab(tab as FeedTab);
    // Update ordering based on the new tab (unless overridden by query param)
    const orderingParam = searchParams.get('ordering');
    if (!orderingParam) {
      setOrdering(getDefaultOrdering(tab as FeedTab, followingFeedExperiment));
    }
    // Set navigating state to true to show loading state
    setIsNavigating(true);

    // Preserve query params (hot_score_version and ordering)
    // Only preserve if they were explicitly set by the user, not defaults
    const params = new URLSearchParams();
    const hotScoreParam = searchParams.get('hot_score_version');
    if (hotScoreParam) {
      params.set('hot_score_version', hotScoreParam);
    }
    if (orderingParam) {
      params.set('ordering', orderingParam);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';

    // Navigate to the appropriate URL
    if (tab === 'popular') {
      router.push(`/${queryString}`);
    } else {
      router.push(`/${tab}${queryString}`);
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
      showGearIcon={activeTab === 'following'}
      onGearClick={() => setIsManageTopicsModalOpen(true)}
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

  // Only track experiment if user is on following feed and hasn't manually overridden ordering
  // When orderingParam is set (e.g., ?ordering=latest), experimentVariant will be undefined
  // This ensures admin overrides don't contaminate experiment data
  const isInExperiment = activeTab === 'following' && !orderingParam;

  return (
    <PageLayout>
      {isDebugMode && activeTab === 'following' && (
        <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-y border-gray-200">
          {orderingParam ? (
            <>🔧 Manual Override: ordering={orderingParam} (Not in experiment)</>
          ) : (
            <>
              🧪 Experiment Active | Variant: {followingFeedExperiment} | Ordering: {ordering} | Hot
              Score: v{hotScoreVersion === 'v2' ? '2' : '1'}
            </>
          )}
        </div>
      )}
      <FeedContent
        entries={entries}
        isLoading={combinedIsLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        tabs={feedTabs}
        activeTab={activeTab}
        experimentVariant={isInExperiment ? followingFeedExperiment : undefined}
        ordering={ordering}
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
