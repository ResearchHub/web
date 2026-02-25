'use client';

import { FC, useState, useEffect } from 'react';
import { useFeed, FeedTab } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedContent } from './FeedContent';
import { ForYouFeedBanner } from './ForYouFeedBanner';
import { useSearchParams } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';

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

  const { activeTab } = useFeedTabs(() => {
    setIsNavigating(true);
  });

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

  const renderHeader = () => (
    <MainPageHeader
      icon={<FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#3971ff" />}
      title="Home"
      subtitle="Explore cutting-edge research from leading preprint servers."
      showTitle={false}
    />
  );

  const banner = activeTab === 'for-you' ? <ForYouFeedBanner /> : undefined;

  return (
    <FeedContent
      showFundraiseHeaders={false}
      showGrantHeaders={false}
      showPostHeaders={false}
      entries={entries}
      isLoading={combinedIsLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      header={renderHeader()}
      banner={banner}
      activeTab={activeTab}
      ordering={ordering}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
    />
  );
};

export default Feed;
