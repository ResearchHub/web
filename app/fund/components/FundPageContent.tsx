'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FundingSortOption } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { createTabConfig, getSortOptions } from '@/components/Fund/lib/FundingFeedConfig';

interface FundPageContentProps {
  marketplaceTab: 'grants' | 'needs-funding';
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    tabs: feedTabsList,
    activeTab,
    handleTabChange,
  } = useFeedTabs(() => setIsNavigating(true));

  const defaultSort = marketplaceTab === 'needs-funding' ? 'best' : 'newest';
  const sortBy = (searchParams.get('ordering') as FundingSortOption) || defaultSort;
  const TAB_CONFIG = createTabConfig(<GrantRightSidebar />, <FundRightSidebar />);
  const config = TAB_CONFIG[marketplaceTab];
  const sortOptions = getSortOptions(marketplaceTab);

  const handleSortChange = (newSort: FundingSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('ordering', newSort);
    } else {
      params.delete('ordering');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // When "completed" is selected, fetch closed fundraises with newest ordering
  const isCompleted = sortBy === 'completed';
  const effectiveFundraiseStatus = isCompleted ? 'CLOSED' : config.fundraiseStatus;
  const effectiveOrdering = isCompleted ? 'newest' : sortBy || undefined;

  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useFeed('all', {
    contentType: config.contentType,
    endpoint: config.endpoint,
    fundraiseStatus: effectiveFundraiseStatus,
    ordering: effectiveOrdering,
  });

  useEffect(() => {
    setIsNavigating(false);
  }, [marketplaceTab]);

  const combinedLoading = isLoading || isNavigating;

  return (
    <PageLayout rightSidebar={config.sidebar}>
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title={config.title}
        subtitle={config.subtitle}
        showTitle={false}
      />
      <div className="mb-6 border-b">
        <FeedTabs
          activeTab={activeTab}
          tabs={feedTabsList}
          onTabChange={handleTabChange}
          isLoading={combinedLoading}
          showSorting
          sortOption={sortBy as any}
          onSortChange={(sort) => handleSortChange(sort as any)}
          sortOptions={sortOptions}
        />
      </div>
      <FeedContent
        entries={entries}
        isLoading={combinedLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
        showFundraiseHeaders={false}
        showPostHeaders={false}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        activeTab="all"
        lastClickedEntryId={lastClickedEntryId ?? undefined}
      />
    </PageLayout>
  );
}
