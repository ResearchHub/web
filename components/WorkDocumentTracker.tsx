'use client';

import { useEffect } from 'react';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';
import { WorkDocumentViewedEvent } from '@/types/analytics';
import { mapAppContentTypeToApiType } from '@/utils/contentTypeMapping';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

interface WorkDocumentTrackerProps {
  work: Work;
  metadata: WorkMetadata;
  tab?: string;
}

export function WorkDocumentTracker({ work, metadata, tab }: WorkDocumentTrackerProps) {
  const { user } = useUser();

  useEffect(() => {
    if (!work || !metadata) return;

    const workDocumentViewedPayload: WorkDocumentViewedEvent = {
      related_work: {
        id: work.id.toString(),
        content_type: mapAppContentTypeToApiType(work.contentType),
        unified_document_id: work.unifiedDocumentId?.toString(),
      },
      tab,
    };

    AnalyticsService.logEventWithUserProperties(
      LogEvent.WORK_DOCUMENT_VIEWED,
      workDocumentViewedPayload,
      user
    );
  }, [work, metadata, tab]);

  return null; // This component doesn't render anything
}
