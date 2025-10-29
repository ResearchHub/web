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
import { useState, useEffect } from 'react';
import { createTabConfig } from '@/components/Fund/lib/FundingFeedConfig';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort_by = (searchParams.get('ordering') as FundingSortOption) || '';
  const include_ended = searchParams.get('includeEnded') !== 'false';
  const TAB_CONFIG = createTabConfig(<GrantRightSidebar />, <FundRightSidebar />);
  const config = TAB_CONFIG[marketplaceTab];
  const [is_sort_changing, set_is_sort_changing] = useState(false);

  const handleSortChange = (newSort: FundingSortOption) => {
    set_is_sort_changing(true);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('ordering', newSort);
    } else {
      params.delete('ordering');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleIncludeEndedChange = (newIncludeEnded: boolean) => {
    set_is_sort_changing(true);
    const params = new URLSearchParams(searchParams.toString());
    if (newIncludeEnded) {
      // Default is true, so we don't need to set the parameter
      params.delete('includeEnded');
    } else {
      // Only set parameter when explicitly excluding ended proposals
      params.set('includeEnded', 'false');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: config.contentType,
    endpoint: config.endpoint,
    fundraiseStatus: config.fundraiseStatus,
    ordering: sort_by || undefined,
    includeEnded: include_ended,
  });

  // Reset loading state when sort changes from URL updates
  useEffect(() => {
    if (is_sort_changing) {
      set_is_sort_changing(false);
    }
  }, [sort_by, include_ended]);

  useEffect(() => {
    if (!isLoading && is_sort_changing) {
      set_is_sort_changing(false);
    }
  }, [isLoading, is_sort_changing]);

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
        sortBy={sort_by}
        onSortChange={handleSortChange}
        includeEnded={include_ended}
        onIncludeEndedChange={handleIncludeEndedChange}
      />
      <FeedContent
        entries={is_sort_changing ? [] : entries}
        isLoading={isLoading || is_sort_changing}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
      />
    </PageLayout>
  );
}
