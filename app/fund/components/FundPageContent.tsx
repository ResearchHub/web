'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { AllFundingRightSidebar } from '@/components/Fund/AllFundingRightSidebar';
import { FundingMobileInfo } from '@/components/Fund/FundingMobileInfo';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FundingSortOption } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { createTabConfig, getSortOptions } from '@/components/Fund/lib/FundingFeedConfig';
import Link from 'next/link';

interface FundPageContentProps {
  marketplaceTab: 'all' | 'grants' | 'needs-funding';
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { tabs: feedTabsList, activeTab, handleTabChange } = useFeedTabs();

  const defaultSort = marketplaceTab === 'needs-funding' ? 'best' : 'newest';
  const sortBy = (searchParams.get('ordering') as FundingSortOption) || defaultSort;
  const TAB_CONFIG = createTabConfig(
    <GrantRightSidebar />,
    <FundRightSidebar />,
    <AllFundingRightSidebar />
  );
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

  return (
    <PageLayout rightSidebar={config.sidebar}>
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title={config.title}
        subtitle={config.subtitle}
        showTitle={false}
      />
      <div className="border-b">
        <FeedTabs
          activeTab={activeTab}
          tabs={feedTabsList}
          onTabChange={handleTabChange}
          isLoading={isLoading}
          showSorting
          sortOption={sortBy as any}
          onSortChange={(sort) => handleSortChange(sort as any)}
          sortOptions={sortOptions}
        />
      </div>
      {/* Mobile-only: Horizontal scrolling CTAs and info drawer */}
      {activeTab === 'all' && (
        <div className="lg:hidden mt-4 mb-4">
          <FundingMobileInfo />
        </div>
      )}
      {activeTab === 'needs-funding' && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 mt-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-700">Explore available funding opportunities</span>
          </div>
          <Link
            href="/notebook?newFunding=true"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            Create a proposal →
          </Link>
        </div>
      )}
      {activeTab === 'grants' && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 mt-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-700">Support research projects seeking funding</span>
          </div>
          <Link
            href="/notebook?newFunding=true"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create a proposal →
          </Link>
        </div>
      )}
      <FeedContent
        entries={entries}
        isLoading={isLoading}
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
