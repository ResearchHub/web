'use client';

import { useCallback } from 'react';
import { FeedEntry } from '@/types/feed';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import {
  buildPayloadForFeedItemClick,
  buildPayloadForFeedItemAbstractExpanded,
} from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useFeedSource } from '@/hooks/useFeedSource';
import { useDeviceType } from '@/hooks/useDeviceType';

interface UseFeedItemAnalyticsTrackingOptions {
  entry: FeedEntry | null;
  feedPosition?: number;
  feedOrdering?: string;
  impression?: string[] | undefined;
}

/**
 * Custom hook for tracking feed item interactions with analytics.
 * Provides handlers for tracking feed item clicks and abstract expansions.
 *
 * @param options - Configuration for the feed item analytics tracking
 * @returns An object containing handleFeedItemClick and handleAbstractExpanded functions
 */
export function useFeedItemAnalyticsTracking({
  entry,
  feedPosition,
  feedOrdering,
  impression,
}: UseFeedItemAnalyticsTrackingOptions) {
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

  const handleAbstractExpanded = useCallback(() => {
    if (!entry) {
      return;
    }

    try {
      const payload = buildPayloadForFeedItemAbstractExpanded(entry, {
        feedPosition,
        feedSource,
        feedTab,
        deviceType,
        feedOrdering,
        impression,
      });

      AnalyticsService.logEventWithUserProperties(
        LogEvent.FEED_ITEM_ABSTRACT_EXPANDED,
        payload,
        user
      );
    } catch (analyticsError) {
      console.warn('Failed to track feed item abstract expansion analytics:', analyticsError);
    }
  }, [entry, feedPosition, feedSource, feedTab, deviceType, user, feedOrdering, impression]);

  return {
    handleFeedItemClick,
    handleAbstractExpanded,
  };
}
