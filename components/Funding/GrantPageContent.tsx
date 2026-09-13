'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { FeedEntry } from '@/types/feed';
import type { Application } from '@/types/funding';
import type { FundingPool } from '@/types/grant';
import { ID } from '@/types/root';

export type GrantBannerTab = 'proposals' | 'details' | 'activity';

interface GrantTabContextValue {
  activeTab: GrantBannerTab;
  setActiveTab: (tab: GrantBannerTab) => void;
  activity: {
    entries: FeedEntry[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    count: number;
    page: number;
    loadMore: () => void;
    feedKey: string;
    restoredScrollPosition: number | null;
    lastClickedEntryId: string | null;
    restorationTab: string;
  };
  fundingPool: FundingPool | null;
  setFundingPool: (pool: FundingPool | null) => void;
  applications: Application[];
  grantCreatedByUserId: ID | null;
}

const GrantTabContext = createContext<GrantTabContextValue | null>(null);

export function useGrantTab() {
  const ctx = useContext(GrantTabContext);
  if (!ctx) throw new Error('useGrantTab must be used within GrantTabProvider');
  return ctx;
}

export function useGrantAllocateContext(): GrantTabContextValue | null {
  return useContext(GrantTabContext);
}

export function GrantTabProvider({
  children,
  defaultTab = 'details',
  grantId,
  fundingPool: initialFundingPool = null,
  applications: initialApplications = [],
  grantCreatedByUserId = null,
}: {
  children: ReactNode;
  defaultTab?: GrantBannerTab;
  grantId?: number | string;
  fundingPool?: FundingPool | null;
  applications?: Application[];
  grantCreatedByUserId?: ID | null;
}) {
  const [activeTab, setActiveTab] = useState<GrantBannerTab>(defaultTab);
  const [fundingPool, setFundingPool] = useState<FundingPool | null>(initialFundingPool);

  useEffect(() => {
    setFundingPool(initialFundingPool);
  }, [initialFundingPool]);

  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    count,
    page,
    loadMore,
    feedKey,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useActivityFeed({
    scope: 'grants',
    grantId,
  });

  const handleSetFundingPool = useCallback((pool: FundingPool | null) => {
    setFundingPool(pool);
  }, []);

  return (
    <GrantTabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activity: {
          entries,
          isLoading,
          isLoadingMore,
          hasMore,
          count,
          page,
          loadMore,
          feedKey,
          restoredScrollPosition,
          lastClickedEntryId,
          restorationTab,
        },
        fundingPool,
        setFundingPool: handleSetFundingPool,
        applications: initialApplications,
        grantCreatedByUserId,
      }}
    >
      {children}
    </GrantTabContext.Provider>
  );
}
