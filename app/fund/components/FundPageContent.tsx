'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import {
  MarketplaceTabs,
  MarketplaceTab,
  FundingSortOption,
} from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { createTabConfig } from '@/components/Fund/lib/FundingFeedConfig';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSort = marketplaceTab === 'needs-funding' ? 'best' : 'newest';
  const sortBy = (searchParams.get('ordering') as FundingSortOption) || defaultSort;
  const TAB_CONFIG = createTabConfig(<GrantRightSidebar />, <FundRightSidebar />);
  const config = TAB_CONFIG[marketplaceTab];

  const handleSortChange = (newSort: FundingSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('ordering', newSort);
    } else {
      params.delete('ordering');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { entries, isLoading, hasMore, loadMore, restoredScrollPosition, page } = useFeed('all', {
    contentType: config.contentType,
    endpoint: config.endpoint,
    fundraiseStatus: config.fundraiseStatus,
    ordering: sortBy || undefined,
  });

  return (
    <PageLayout rightSidebar={config.sidebar}>
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title={config.title}
        subtitle={config.subtitle}
      />
      <MarketplaceTabs
        activeTab={marketplaceTab}
        onTabChange={() => {}}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
        restoredScrollPosition={restoredScrollPosition}
        page={page}
        activeTab="all"
      />
    </PageLayout>
  );
}
