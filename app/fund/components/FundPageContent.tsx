'use client';

import { useEffect } from 'react';
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
  const defaultSort = marketplaceTab === 'needs-funding' ? 'best' : '';
  const sortBy = (searchParams.get('ordering') as FundingSortOption) || defaultSort;
  const includeEnded = searchParams.get('include_ended') !== 'false';
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

  const handleIncludeEndedChange = (newIncludeEnded: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newIncludeEnded) {
      // Default is true, so we don't need to set the parameter
      params.delete('include_ended');
    } else {
      // Only set parameter when explicitly excluding ended proposals
      params.set('include_ended', 'false');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Set default 'best' sort in URL for needs-funding tab on initial load
  useEffect(() => {
    if (marketplaceTab === 'needs-funding' && !searchParams.get('ordering')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('ordering', 'best');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [marketplaceTab, searchParams, router]);

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: config.contentType,
    endpoint: config.endpoint,
    fundraiseStatus: config.fundraiseStatus,
    ordering: sortBy || undefined,
    includeEnded: includeEnded,
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
        includeEnded={includeEnded}
        onIncludeEndedChange={handleIncludeEndedChange}
      />
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
      />
    </PageLayout>
  );
}
