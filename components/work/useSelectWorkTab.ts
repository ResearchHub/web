'use client';

import { useCallback } from 'react';
import type { TabType } from '@/components/work/WorkTabs';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForDocumentTabClick } from '@/types/analytics';
import type { Work } from '@/types/work';
import { buildWorkUrl } from '@/utils/url';

/** Params that survive a tab change: the registered-report stage and a private link's token. */
const KEPT_PARAMS = ['rr', SHARE_TOKEN_PARAM];

/** The tab's own route, so a reload or a shared link opens the same tab. */
function workTabUrl(work: Work, tab: TabType): string {
  const path = buildWorkUrl({
    id: work.id,
    slug: work.slug,
    // Questions are posts with a route of their own.
    contentType: work.postType === 'QUESTION' ? 'question' : work.contentType,
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
 * Switching a work's tab: the page shows its content, and the address bar
 * follows to the tab's route. Clicks on the tab strip itself are logged.
 */
export function useSelectWorkTab(work: Work) {
  const { activeTab, setActiveTab } = useWorkTab();
  const { user } = useUser();
  const deviceType = useDeviceType();

  /** Opens a tab from anywhere on the page. */
  const showTab = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      window.history.replaceState(null, '', workTabUrl(work, tab));
    },
    [work, setActiveTab]
  );

  /** A click on the tab strip: opens the tab and logs the click. */
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

  return { activeTab, showTab, selectTab };
}
