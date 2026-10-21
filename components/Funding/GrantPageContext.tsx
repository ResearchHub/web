'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
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

/** The RFP tabs' anchor, which opening a tab from elsewhere scrolls back to. */
export const GRANT_TABS_ID = 'rfp-tabs';

interface GrantPageContextValue {
  activeTab: GrantBannerTab;
  setActiveTab: (tab: GrantBannerTab) => void;
  /** Opens a tab from elsewhere on the page, and scrolls the tabs into view. */
  showTab: (tab: GrantBannerTab) => void;
  grantId?: string;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
  /** The funder's own award, before backers add to the pool. */
  grantAmount: FundingPoolAmount | null;
  isPending: boolean;
  /** Taking proposals: open, and before its end date if it has one. */
  isActive: boolean;
  /** Apply is offered: the page has an RFP and it is active. */
  canApply: boolean;
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

/** The RFP's activity feed, which the Activity tab, its count and the sidebar card show. */
interface GrantActivity {
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
}

const GrantPageContext = createContext<GrantPageContextValue | null>(null);
const GrantActivityContext = createContext<GrantActivity | null>(null);

/** The RFP page's state: its grant, the live pool, the open tab and the Apply panel. */
export function useGrantPage() {
  const ctx = useContext(GrantPageContext);
  if (!ctx) throw new Error('useGrantPage must be used within GrantPageProvider');
  return ctx;
}

/** The RFP page's activity feed. */
export function useGrantActivity() {
  const ctx = useContext(GrantActivityContext);
  if (!ctx) throw new Error('useGrantActivity must be used within GrantPageProvider');
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

  const showTab = useCallback((tab: GrantBannerTab) => {
    setActiveTab(tab);
    document.getElementById(GRANT_TABS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const page = useMemo((): GrantPageContextValue => {
    const isActive = grant ? isGrantActive(grant) : false;
    return {
      activeTab,
      setActiveTab,
      showTab,
      grantId,
      organization: grant?.organization,
      applicationVisibility: grant?.applicationVisibility,
      grantAmount: grant ? { usd: grant.amount.usd ?? 0, rsc: grant.amount.rsc ?? 0 } : null,
      isPending: grant?.status === 'PENDING',
      isActive,
      canApply: !!grantId && isActive,
      isPoolOpen: isActive && fundingPool?.status === 'OPEN',
      fundingPool,
      setFundingPool,
      applications: grant?.applications ?? [],
      grantCreatedByUserId: grant?.createdBy?.id ?? null,
      isApplyPanelOpen,
      setIsApplyPanelOpen,
    };
  }, [activeTab, showTab, grant, grantId, fundingPool, isApplyPanelOpen]);

  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    count,
    page: feedPage,
    loadMore,
    feedKey,
    restoredScrollPosition,
    lastClickedEntryId,
  } = useActivityFeed({ scope: 'grants', grantId });

  // Kept apart from the page's state, so the feed's updates as it loads
  // re-render only what shows the feed, not the cover, facts or pool card.
  const activity = useMemo(
    (): GrantActivity => ({
      entries,
      isLoading,
      isLoadingMore,
      hasMore,
      count,
      page: feedPage,
      loadMore,
      feedKey,
      restoredScrollPosition,
      lastClickedEntryId,
    }),
    [
      entries,
      isLoading,
      isLoadingMore,
      hasMore,
      count,
      feedPage,
      loadMore,
      feedKey,
      restoredScrollPosition,
      lastClickedEntryId,
    ]
  );

  return (
    <GrantPageContext.Provider value={page}>
      <GrantActivityContext.Provider value={activity}>{children}</GrantActivityContext.Provider>
    </GrantPageContext.Provider>
  );
}
