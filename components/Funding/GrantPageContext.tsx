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
import { useRouter } from 'next/navigation';
import { handOffRfp } from '@/components/AIMode/rfpHandoff';
import { newDraftTarget, workspaceHref } from '@/components/AIMode/workspaceUrl';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { FeedEntry } from '@/types/feed';
import type { Application } from '@/types/funding';
import {
  isGrantActive,
  type FundingPool,
  type FundingPoolAmount,
  type FundingMechanism,
  type Grant,
  type GrantApplicationVisibility,
} from '@/types/grant';
import type { AuthorProfile } from '@/types/authorProfile';
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
  /**
   * Who funds the RFP: its organization, or, when it names none, the person
   * who opened it.
   */
  organization?: string;
  /**
   * The funder's own account: the contact named for the organization, as
   * funders' own accounts are, or the person who opened an RFP that names no
   * organization. Its face is the byline's and the cover's.
   */
  organizationProfile?: AuthorProfile;
  applicationVisibility?: GrantApplicationVisibility;
  fundingMechanism: FundingMechanism;
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
  /**
   * Apply, from the pool card and the phone's action bar alike: the workspace's
   * new-proposal screen, with this RFP already picked.
   */
  applyToRfp: () => void;
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

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

/** The contact whose account is named for the organization, as funders' own accounts are. */
function findOrganizationProfile(grant: Grant): AuthorProfile | undefined {
  if (!grant.organization?.trim()) return undefined;
  const organization = normalizeName(grant.organization);
  return grant.contacts?.find(
    (contact) =>
      contact.authorProfile && normalizeName(contact.authorProfile.fullName) === organization
  )?.authorProfile;
}

const GrantPageContext = createContext<GrantPageContextValue | null>(null);
const GrantActivityContext = createContext<GrantActivity | null>(null);

/** The RFP page's state: its grant, the live pool and the open tab. */
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
  title,
  imageUrl,
}: {
  children: ReactNode;
  defaultTab?: GrantBannerTab;
  grant?: Grant;
  /** The RFP's name and cover, which its post holds rather than its grant. */
  title?: string;
  imageUrl?: string | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GrantBannerTab>(defaultTab);
  const [fundingPool, setFundingPool] = useState<FundingPool | null>(grant?.fundingPool ?? null);

  // A refresh brings the server's pool, which wins over the one kept here.
  useEffect(() => {
    setFundingPool(grant?.fundingPool ?? null);
  }, [grant?.fundingPool]);

  const grantId = grant?.id != null ? String(grant.id) : undefined;

  const showTab = useCallback((tab: GrantBannerTab) => {
    setActiveTab(tab);
    document.getElementById(GRANT_TABS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // An RFP that names no organization is funded by whoever opened it.
  const organizationName = grant?.organization?.trim() || undefined;
  const opener = grant?.createdBy?.authorProfile;
  const organization = organizationName ?? (opener?.fullName || undefined);
  const organizationProfile = grant
    ? organizationName
      ? findOrganizationProfile(grant)
      : opener
    : undefined;

  // The workspace's start screen opens with the RFP picked: it is handed over
  // here, so the workspace need not ask the server for what this page has.
  const applyToRfp = useCallback(() => {
    if (!grant || !grantId) return;
    handOffRfp({
      id: grantId,
      shortTitle: grant.shortTitle || title || '',
      imageUrl: imageUrl ?? '',
      fundingAmount: grant.amount.usd ?? 0,
      organization: organization ?? '',
      applicationVisibility: grant.applicationVisibility,
      fundingMechanism: grant.fundingMechanism ?? 'FUNDING',
    });
    router.push(workspaceHref(newDraftTarget('need_funding', grantId)));
  }, [grant, grantId, title, imageUrl, organization, router]);

  const page = useMemo((): GrantPageContextValue => {
    const isActive = grant ? isGrantActive(grant) : false;
    return {
      activeTab,
      setActiveTab,
      showTab,
      grantId,
      organization,
      organizationProfile,
      applicationVisibility: grant?.applicationVisibility,
      fundingMechanism: grant?.fundingMechanism ?? 'FUNDING',
      grantAmount: grant ? { usd: grant.amount.usd ?? 0, rsc: grant.amount.rsc ?? 0 } : null,
      isPending: grant?.status === 'PENDING',
      isActive,
      canApply: !!grantId && isActive,
      isPoolOpen: isActive && fundingPool?.status === 'OPEN',
      fundingPool,
      setFundingPool,
      applications: grant?.applications ?? [],
      grantCreatedByUserId: grant?.createdBy?.id ?? null,
      applyToRfp,
    };
  }, [
    activeTab,
    showTab,
    grant,
    grantId,
    fundingPool,
    organization,
    organizationProfile,
    applyToRfp,
  ]);

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
  // re-render only what shows the feed, not the cover, byline or pool card.
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
