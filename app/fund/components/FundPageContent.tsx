'use client';

import { useCallback } from 'react';
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
import { FundingPromotionCards } from '@/components/Fund/FundingPromotionCards';
import { FundingFilters } from '@/components/Fund/FundingFilters';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FundingSortOption } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { createTabConfig, getSortOptions } from '@/components/Fund/lib/FundingFeedConfig';

interface FundPageContentProps {
  marketplaceTab: 'all' | 'opportunities' | 'needs-funding';
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

  // Filter state derived from URL
  const status = searchParams.get('status') || 'all';
  const peerReview = searchParams.get('peer_review') || 'all';
  const taxDeductible = searchParams.get('tax_deductible') === 'true';

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSortChange = (newSort: FundingSortOption) => {
    updateParams({ ordering: newSort || null });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'all' ? null : value });
  };

  const handlePeerReviewChange = (value: string) => {
    updateParams({ peer_review: value === 'all' ? null : value });
  };

  const handleTaxDeductibleToggle = () => {
    updateParams({ tax_deductible: taxDeductible ? null : 'true' });
  };

  // Derive effective fundraise status from pill filter + sort
  const isCompletedSort = sortBy === 'completed';
  const isCompletedFilter = status === 'completed';
  const showClosed = isCompletedSort || isCompletedFilter;
  const effectiveFundraiseStatus = showClosed ? 'CLOSED' : config.fundraiseStatus;
  const effectiveOrdering = isCompletedSort ? 'newest' : sortBy || undefined;

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
      {activeTab === 'needs-funding' && (
        <div className="py-4">
          <FundingPromotionCards />
        </div>
      )}
      <div className="border-b">
        <FeedTabs
          activeTab={activeTab}
          tabs={feedTabsList}
          onTabChange={handleTabChange}
          isLoading={isLoading}
        />
      </div>
      {/* Pill filters */}
      <FundingFilters
        activeTab={marketplaceTab}
        status={status}
        onStatusChange={handleStatusChange}
        peerReview={peerReview}
        onPeerReviewChange={handlePeerReviewChange}
        taxDeductible={taxDeductible}
        onTaxDeductibleToggle={handleTaxDeductibleToggle}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      {/* Mobile-only: Horizontal scrolling CTAs and info drawer */}
      {activeTab === 'needs-funding' && (
        <div className="lg:hidden mt-4 mb-4">
          <FundingMobileInfo />
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
