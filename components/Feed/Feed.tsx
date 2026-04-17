'use client';

import { FC, useState, useEffect } from 'react';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedContent } from './FeedContent';
import { ForYouFeedBanner } from './ForYouFeedBanner';
import { useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { FeedTabs } from './FeedTabs';
import { ManageTopicsModal } from '@/components/modals/ManageTopicsModal';
import { useSession } from 'next-auth/react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
}

const getDefaultOrdering = (tab: FeedTab): string | undefined => {
  if (tab === 'popular') return undefined;
  if (tab === 'following') return 'hot_score_v2';
  if (tab === 'latest') return 'latest';
  if (tab === 'for-you') return undefined;
  return undefined;
};

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData }) => {
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { status } = useSession();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const { activeTab, tabs, highlightedTab, handleTabChange } = useFeedTabs(() => {
    setIsNavigating(true);
  });

  const handleCustomize = () => {
    if (status === 'authenticated') {
      setIsCustomizeOpen(true);
    } else {
      executeAuthenticatedAction(() => setIsCustomizeOpen(true));
    }
  };

  const orderingParam = searchParams.get('ordering');
  const filterParam = searchParams.get('filter');
  const userIdParam = searchParams.get('user_id');
  const [ordering, setOrdering] = useState<string | undefined>(
    orderingParam || getDefaultOrdering(defaultTab)
  );

  const isDebugMode = searchParams?.get('debug') !== null;

  const feedOptions = {
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

  const combinedIsLoading = isLoading || isNavigating;

  const header = activeTab === 'for-you' ? <ForYouFeedBanner /> : undefined;

  const isFollowing = activeTab === 'following';

  const inlineTabs = (
    <FeedTabs
      activeTab={highlightedTab}
      tabs={tabs}
      onTabChange={handleTabChange}
      showGearIcon={isFollowing}
      onGearClick={handleCustomize}
      showSorting={isFollowing}
      sortOption={ordering || 'hot_score_v2'}
      onSortChange={setOrdering}
    />
  );

  const feedTitles: Record<string, string> = {
    popular: 'Popular Research',
    latest: 'Latest Research',
    'for-you': 'Recommended Research',
    following: 'Research You Follow',
  };
  const feedTitle = feedTitles[activeTab] || 'Research Feed';

  return (
    <>
      <h1 className="sr-only">{feedTitle}</h1>
      <FeedContent
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        entries={entries}
        isLoading={combinedIsLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        tabs={inlineTabs}
        activeTab={activeTab}
        ordering={ordering}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        lastClickedEntryId={lastClickedEntryId ?? undefined}
      />
      <ManageTopicsModal isOpen={isCustomizeOpen} onClose={() => setIsCustomizeOpen(false)} />
    </>
  );
};

export default Feed;
