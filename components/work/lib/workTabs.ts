'use client';

import { useCallback } from 'react';
import { useWorkTab, type TabType } from '@/components/work/WorkHeader/WorkTabContext';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForDocumentTabClick } from '@/types/analytics';
import type { Work } from '@/types/work';
import { buildWorkUrl } from '@/utils/url';

/** The proposal tabs' anchor, which opening a tab from elsewhere scrolls back to. */
export const PROPOSAL_TABS_ID = 'proposal-tabs';

/** Params that survive a tab change: the registered-report stage and a private link's token. */
const KEPT_PARAMS = ['rr', SHARE_TOKEN_PARAM];

/** The tab's own route, so a reload or a shared link opens the same tab. */
function workTabUrl(work: Work, tab: TabType): string {
  const path = buildWorkUrl({
    id: work.id,
    slug: work.slug,
    contentType: work.contentType,
    tab: tab === 'paper' ? undefined : tab,
  });
  const currentParams = new URLSearchParams(window.location.search);
  const keptParams = new URLSearchParams();
  for (const key of KEPT_PARAMS) {
    const value = currentParams.get(key);
    if (value) keptParams.set(key, value);
  }
  const query = keptParams.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Opens one of a work's tabs from anywhere on its page: the page shows its
 * content, and the address bar follows to the tab's route.
 */
export function useShowWorkTab(work: Work) {
  const { setActiveTab } = useWorkTab();
  return useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      window.history.replaceState(null, '', workTabUrl(work, tab));
    },
    [work, setActiveTab]
  );
}

/** Clicks on a work's tab strip: they open the tab and are logged. */
export function useSelectWorkTab(work: Work) {
  const { activeTab } = useWorkTab();
  const showTab = useShowWorkTab(work);
  const { user } = useUser();
  const deviceType = useDeviceType();

  const selectTab = useCallback(
    (tab: TabType) => {
      if (tab === activeTab) return;
      showTab(tab);
      try {
        const payload = buildPayloadForDocumentTabClick(work, { clickedTab: tab, deviceType });
        AnalyticsService.logEventWithUserProperties(LogEvent.DOCUMENT_TAB_CLICKED, payload, user);
      } catch (error) {
        console.warn('Failed to track document tab click analytics:', error);
      }
    },
    [activeTab, showTab, work, deviceType, user]
  );

  return { activeTab, selectTab };
}

/**
 * Opens one of a proposal's tabs from elsewhere on its page, and scrolls the
 * tabs into view. A card in the phone sidebar drawer closes the drawer first,
 * or the tab would open behind it.
 */
export function useShowProposalTab(work: Work) {
  const showTab = useShowWorkTab(work);
  const { setMobileSidebarOpen } = useWorkTab();
  return useCallback(
    (tab: TabType) => {
      setMobileSidebarOpen(false);
      showTab(tab);
      document
        .getElementById(PROPOSAL_TABS_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [showTab, setMobileSidebarOpen]
  );
}
