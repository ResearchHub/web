'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { FeedEntry } from '@/types/feed';
import type { Application } from '@/types/funding';
import {
  isGrantActive,
  type FundingPool,
  type FundingPoolAmount,
  type Grant,
  type GrantApplicationVisibility,
} from '@/types/grant';
import { ID } from '@/types/root';

export type GrantBannerTab = 'proposals' | 'details' | 'activity';

interface GrantPageContextValue {
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
  grantId?: string;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
  /** The funder's own award, before backers add to the pool. */
  grantAmount: FundingPoolAmount | null;
  isPending: boolean;
  /** Taking proposals: open, and before its end date if it has one. */
  isActive: boolean;
  /** Taking contributions too: the RFP is active and its pool is open. */
  isPoolOpen: boolean;
  /** Starts as the page loaded it and follows the contributions made here. */
  fundingPool: FundingPool | null;
  setFundingPool: (pool: FundingPool | null) => void;
  applications: Application[];
  grantCreatedByUserId: ID | null;
  /** Apply opens from the pool card and the phone's action bar alike. */
  isApplyPanelOpen: boolean;
  setIsApplyPanelOpen: (open: boolean) => void;
}

const GrantPageContext = createContext<GrantPageContextValue | null>(null);

/** The RFP page's state: its grant, the live pool, the open tab and the activity feed. */
export function useGrantPage() {
  const ctx = useContext(GrantPageContext);
  if (!ctx) throw new Error('useGrantPage must be used within GrantPageProvider');
  return ctx;
}

/** The RFP page's state where there may be no RFP page, e.g. a proposal card in a feed. */
export function useGrantAllocateContext(): GrantPageContextValue | null {
  return useContext(GrantPageContext);
}

export function GrantPageProvider({
  children,
  defaultTab = 'details',
  grant,
}: {
  children: ReactNode;
  defaultTab?: GrantBannerTab;
  grant?: Grant;
}) {
  const [activeTab, setActiveTab] = useState<GrantBannerTab>(defaultTab);
  const [fundingPool, setFundingPool] = useState<FundingPool | null>(grant?.fundingPool ?? null);
  const [isApplyPanelOpen, setIsApplyPanelOpen] = useState(false);

  // A refresh brings the server's pool, which wins over the one kept here.
  useEffect(() => {
    setFundingPool(grant?.fundingPool ?? null);
  }, [grant?.fundingPool]);

  const grantId = grant?.id != null ? String(grant.id) : undefined;
  const isActive = grant ? isGrantActive(grant) : false;

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

  return (
    <GrantPageContext.Provider
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
        grantId,
        organization: grant?.organization,
        applicationVisibility: grant?.applicationVisibility,
        grantAmount: grant ? { usd: grant.amount.usd ?? 0, rsc: grant.amount.rsc ?? 0 } : null,
        isPending: grant?.status === 'PENDING',
        isActive,
        isPoolOpen: isActive && fundingPool?.status === 'OPEN',
        fundingPool,
        setFundingPool,
        applications: grant?.applications ?? [],
        grantCreatedByUserId: grant?.createdBy?.id ?? null,
        isApplyPanelOpen,
        setIsApplyPanelOpen,
      }}
    >
      {children}
    </GrantPageContext.Provider>
  );
}
