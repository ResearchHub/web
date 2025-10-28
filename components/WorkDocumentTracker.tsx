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
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated || !work || !metadata) return;

    const workDocumentViewedPayload: WorkDocumentViewedEvent = {
      related_work: {
        id: work.id.toString(),
        content_type: mapAppContentTypeToApiType(work.contentType),
        topics: metadata.topics.map((topic) => ({
          id: topic.id.toString(),
          name: topic.name,
          slug: topic.slug,
        })),
        primary_topic: metadata.topics[0] && {
          id: metadata.topics[0].id.toString(),
          name: metadata.topics[0].name,
          slug: metadata.topics[0].slug,
        },
        unified_document_id: work.unifiedDocumentId?.toString(),
      },
      tab,
    };

    AnalyticsService.logEventWithUserProperties(
      LogEvent.WORK_DOCUMENT_VIEWED,
      workDocumentViewedPayload,
      user
    );
  }, [isAuthenticated, user, work, metadata, tab]);

  return null; // This component doesn't render anything
}
