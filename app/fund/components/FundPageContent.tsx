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
import { ReactNode, useState, useEffect, useRef } from 'react';

type TabConfig = {
  title: string;
  subtitle: string;
  contentType: 'GRANT' | 'PREREGISTRATION';
  endpoint: 'grant_feed' | 'funding_feed';
  sidebar: ReactNode;
  fundraiseStatus?: 'OPEN' | 'CLOSED';
};

const TAB_CONFIG: Record<MarketplaceTab, TabConfig> = {
  grants: {
    title: 'Request for Proposals',
    subtitle: 'Explore available funding opportunities',
    contentType: 'GRANT',
    endpoint: 'grant_feed',
    sidebar: <GrantRightSidebar />,
  },
  'needs-funding': {
    title: 'Proposals',
    subtitle: 'Fund breakthrough research shaping tomorrow',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: <FundRightSidebar />,
    fundraiseStatus: 'OPEN',
  },
  'previously-funded': {
    title: 'Previously Funded',
    subtitle: 'Browse research that has been successfully funded',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: <FundRightSidebar />,
    fundraiseStatus: 'CLOSED',
  },
};

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortBy = (searchParams.get('ordering') as FundingSortOption) || '';
  const includeEnded = searchParams.get('includeEnded') !== 'false';
  const config = TAB_CONFIG[marketplaceTab];
  const [isSortChanging, setIsSortChanging] = useState(false);
  const previousSortRef = useRef(sortBy);
  const isInitialMount = useRef(true);

  const handleSortChange = (newSort: FundingSortOption) => {
    setIsSortChanging(true);
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set('ordering', newSort);
    } else {
      params.delete('ordering');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleIncludeEndedChange = (newIncludeEnded: boolean) => {
    setIsSortChanging(true);
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
    ordering: sortBy || undefined,
    includeEnded: includeEnded,
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousSortRef.current = sortBy;
      return;
    }

    if (sortBy !== previousSortRef.current) {
      setIsSortChanging(true);
      previousSortRef.current = sortBy;
    }
  }, [sortBy]);

  useEffect(() => {
    if (!isLoading && isSortChanging) {
      setIsSortChanging(false);
    }
  }, [isLoading, isSortChanging]);

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
        entries={isSortChanging ? [] : entries}
        isLoading={isLoading || isSortChanging}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
      />
    </PageLayout>
  );
}
