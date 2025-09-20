'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { extractWorkDocumentInfo } from '@/utils/url';
import { WorkDocumentViewedEvent } from '@/types/analytics';

export function WorkDocumentTracker() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated) return;

    const workInfo = extractWorkDocumentInfo(pathname);

    if (workInfo) {
      const workDocumentViewedPayload: WorkDocumentViewedEvent = {
        content_type: workInfo.contentType,
        work_id: workInfo.workId,
        work_slug: workInfo.workSlug,
      };

      AnalyticsService.logEventWithUserProperties(
        LogEvent.WORK_DOCUMENT_VIEWED,
        workDocumentViewedPayload,
        user
      );
    }
  }, [pathname, isAuthenticated, user]);

  return null; // This component doesn't render anything
}
