'use client';

import { useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { FeedItemClickedEvent } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useFeedSource } from '@/hooks/useFeedSource';
import { useDeviceType } from '@/hooks/useDeviceType';
import {
  mapAppContentTypeToApiType,
  mapAppFeedContentTypeToApiType,
} from '@/utils/contentTypeMapping';

interface UseFeedItemClickOptions {
  entry: FeedEntry;
  feedPosition?: number; // Optional since not all contexts have a position
  experimentVariant?: string;
  feedOrdering?: string;
}

/**
 * Custom hook for tracking feed item clicks with analytics.
 *
 * Returns a memoized function that can be called when a feed item is clicked.
 * The function tracks analytics data including device type, feed position,
 * feed source, and related work information.
 *
 * @param options - Configuration for the feed item click tracking
 * @returns A function to call when the feed item is clicked
 */
export function useFeedItemClick({
  entry,
  feedPosition,
  experimentVariant,
  feedOrdering,
}: UseFeedItemClickOptions) {
  const { user } = useUser();
  const { source: feedSource, tab: feedTab } = useFeedSource();
  const deviceType = useDeviceType();

  const handleFeedItemClick = useCallback(() => {
    try {
      const payload: FeedItemClickedEvent = {
        device_type: deviceType,
        feed_position: feedPosition ?? 1,
        feed_source: feedSource,
        feed_tab: feedTab,
        related_work: {
          id: entry.content.id?.toString() || '',
          content_type:
            'relatedDocumentContentType' in entry.content &&
            entry.content.relatedDocumentContentType
              ? mapAppContentTypeToApiType(entry.content.relatedDocumentContentType)
              : mapAppFeedContentTypeToApiType(entry.content.contentType),
          unified_document_id:
            'unifiedDocumentId' in entry.content
              ? entry.content.unifiedDocumentId
              : entry.relatedWork?.unifiedDocumentId?.toString() || '',
        },
        // Track experiment data for following feed
        ...(experimentVariant &&
          feedTab === 'following' && {
            experiment_name: 'following_feed_ordering',
            experiment_variant: experimentVariant,
            feed_ordering: feedOrdering,
          }),
      };
      AnalyticsService.logEventWithUserProperties(LogEvent.FEED_ITEM_CLICKED, payload, user);
    } catch (analyticsError) {
      console.error('Failed to track feed item click analytics:', analyticsError);
    }
  }, [entry, feedPosition, feedSource, feedTab, deviceType, user, experimentVariant, feedOrdering]);

  return handleFeedItemClick;
}
