'use client';

import { useCallback } from 'react';
import type { TabType } from '@/components/work/WorkTabs';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { SHARE_TOKEN_PARAM } from '@/lib/shareToken/constants';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForDocumentTabClick } from '@/types/analytics';
import type { Work } from '@/types/work';

/** Params that survive a tab change: the registered-report stage and a private link's token. */
const KEPT_PARAMS = ['rr', SHARE_TOKEN_PARAM];

function workTabPath(work: Work, contentType: 'post' | 'fund', tab: TabType): string {
  const basePath =
    contentType === 'fund'
      ? `/proposal/${work.id}/${work.slug}`
      : work.postType === 'QUESTION'
        ? `/question/${work.id}/${work.slug}`
        : `/post/${work.id}/${work.slug}`;
  return tab === 'paper' ? basePath : `${basePath}/${tab}`;
}

/**
 * What switching a work's tab does besides showing its content: the address
 * bar follows, so a reload or a shared link opens the same tab through its
 * route, and the click is logged.
 */
export function useWorkTabChange(work: Work, contentType: 'post' | 'fund') {
  const { user } = useUser();
  const deviceType = useDeviceType();

  return useCallback(
    (tab: TabType) => {
      try {
        const payload = buildPayloadForDocumentTabClick(work, { clickedTab: tab, deviceType });
        AnalyticsService.logEventWithUserProperties(LogEvent.DOCUMENT_TAB_CLICKED, payload, user);
      } catch (error) {
        console.warn('Failed to track document tab click analytics:', error);
      }

      const currentParams = new URLSearchParams(window.location.search);
      const keptParams = new URLSearchParams();
      for (const key of KEPT_PARAMS) {
        const value = currentParams.get(key);
        if (value) keptParams.set(key, value);
      }
      const query = keptParams.toString();
      const path = workTabPath(work, contentType, tab);
      window.history.replaceState(null, '', query ? `${path}?${query}` : path);
    },
    [work, contentType, user, deviceType]
  );
}
