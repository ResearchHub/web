'use client';

import { useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForFeedItemClick } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useFeedSource } from '@/hooks/useFeedSource';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ID } from '@/types/root';

interface UseFeedItemClickOptions {
  entry: FeedEntry | null;
  feedPosition?: number;
  feedOrdering?: string;
  impression?: ID[];
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
  feedOrdering,
  impression,
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
        feedOrdering,
        impression,
      });

      AnalyticsService.logEventWithUserProperties(LogEvent.FEED_ITEM_CLICKED, payload, user);
    } catch (analyticsError) {
      console.warn('Failed to track feed item click analytics:', analyticsError);
    }
  }, [entry, feedPosition, feedSource, feedTab, deviceType, user, feedOrdering, impression]);

  return handleFeedItemClick;
}
