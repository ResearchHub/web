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

const TAB_CONFIG: Record<
  MarketplaceTab,
  {
    title: string;
    subtitle: string;
    fundraiseStatus?: 'OPEN' | 'CLOSED';
  }
> = {
  grants: {
    title: 'Request for Proposals',
    subtitle: 'Explore available funding opportunities',
  },
  'needs-funding': {
    title: 'Proposals',
    subtitle: 'Fund breakthrough research shaping tomorrow',
    fundraiseStatus: 'OPEN',
  },
  'previously-funded': {
    title: 'Previously Funded',
    subtitle: 'Browse research that has been successfully funded',
    fundraiseStatus: 'CLOSED',
  },
};

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortBy = (searchParams.get('sort') as FundingSortOption) || '';

  const handleSortChange = (newSort: FundingSortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const config = TAB_CONFIG[marketplaceTab];
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: marketplaceTab === 'grants' ? 'GRANT' : 'PREREGISTRATION',
    endpoint: marketplaceTab === 'grants' ? 'grant_feed' : 'funding_feed',
    fundraiseStatus: config.fundraiseStatus,
    ordering: sortBy || undefined,
  });

  return (
    <PageLayout
      rightSidebar={marketplaceTab === 'grants' ? <GrantRightSidebar /> : <FundRightSidebar />}
    >
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
      />
    </PageLayout>
  );
}
