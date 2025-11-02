'use client';

import { useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForFeedItemClick } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useFeedSource } from '@/hooks/useFeedSource';
import { useDeviceType } from '@/hooks/useDeviceType';

interface UseFeedItemClickOptions {
  entry: FeedEntry | null;
  feedPosition?: number;
  experimentVariant?: string;
  feedOrdering?: string;
}

/**
 * Custom hook for tracking feed item clicks with analytics.
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
    if (!entry) {
      return;
    }

    try {
      const payload = buildPayloadForFeedItemClick(entry, {
        feedPosition,
        feedSource,
        feedTab,
        deviceType,
        experimentVariant,
        feedOrdering,
      });

      AnalyticsService.logEventWithUserProperties(LogEvent.FEED_ITEM_CLICKED, payload, user);
    } catch (analyticsError) {
      console.error('Failed to track feed item click analytics:', analyticsError);
    }
  }, [entry, feedPosition, feedSource, feedTab, deviceType, user, experimentVariant, feedOrdering]);

  return handleFeedItemClick;
}
