'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FeedEntry } from '@/types/feed';

export interface FeedIdentifier {
  pathname: string;
  tab?: string;
  queryParams?: Record<string, string>;
}

export interface StoredFeedState {
  feedKey: string;
  entries: FeedEntry[];
  scrollPosition: number;
  timestamp: number;
  hasMore?: boolean;
  page?: number;
}

export interface FeedStateData {
  feedKey: string;
  entries: FeedEntry[];
  scrollPosition: number;
  hasMore?: boolean;
  page?: number;
}

const STORAGE_KEY = 'rh_feed_states';
const MAX_TOTAL_ENTRIES = 200;
const MAX_FEEDS = 2;
const MIN_SCROLL_POSITION_TO_STORE = 500;

/**
 * Generate unique key for feed identification
 * Format: pathname|tab:tab|params:key1:value1,key2:value2
 */
export const getFeedKey = (id: FeedIdentifier): string => {
  const parts = [id.pathname];
  if (id.tab) parts.push(`tab:${id.tab}`);

  if (id.queryParams && Object.keys(id.queryParams).length > 0) {
    const sortedParams = Object.keys(id.queryParams)
      .sort()
      .map((key) => `${key}:${id.queryParams![key]}`)
      .join(',');
    parts.push(`params:${sortedParams}`);
  }

  return parts.join('|');
};

interface NavigationContextType {
  isBackNavigation: boolean;
  resetBackNavigation: () => void;
  startTrackingFeed: () => void;
  stopTrackingFeed: () => void;
  saveFeedState: (feedData: FeedStateData) => void;
  getFeedState: (feedKey: string) => StoredFeedState | null;
  clearFeedState: (feedKey: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isBackNavigation: false,
  resetBackNavigation: () => {},
  startTrackingFeed: () => {},
  stopTrackingFeed: () => {},
  saveFeedState: () => {},
  getFeedState: () => null,
  clearFeedState: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    const checkPerformanceAPI = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type === 'back_forward') {
        setIsBackNavigation(true);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      setIsBackNavigation(true);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsBackNavigation(true);
      }
    };

    checkPerformanceAPI();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const resetBackNavigation = () => {
    setIsBackNavigation(false);
  };

  const getAllStoredFeeds = (): Record<string, StoredFeedState> => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  };

  const startTrackingFeed = () => {
    isTrackingRef.current = true;
  };

  const stopTrackingFeed = () => {
    isTrackingRef.current = false;
  };

  const saveFeedState = (feedData: FeedStateData) => {
    if (!isTrackingRef.current) {
      return;
    }

    if (feedData.entries.length === 0) {
      return;
    }

    const scrollPosition =
      feedData.scrollPosition < MIN_SCROLL_POSITION_TO_STORE ? 0 : feedData.scrollPosition;
    if (scrollPosition === 0) {
      return;
    }

    try {
      const allFeeds = getAllStoredFeeds();

      if (feedData.entries.length > MAX_TOTAL_ENTRIES) {
        if (allFeeds[feedData.feedKey]) {
          delete allFeeds[feedData.feedKey];
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
        }
        return;
      }

      const totalEntries = Object.values(allFeeds).reduce(
        (sum, feed) => sum + (feed.entries?.length || 0),
        0
      );

      const isUpdatingExisting = !!allFeeds[feedData.feedKey];
      const existingFeedEntries = isUpdatingExisting
        ? allFeeds[feedData.feedKey]?.entries?.length || 0
        : 0;

      const availableSpace = MAX_TOTAL_ENTRIES - (totalEntries - existingFeedEntries);
      const newFeedEntries = feedData.entries.length;

      if (newFeedEntries > availableSpace) {
        const sortedFeeds = Object.entries(allFeeds)
          .filter(([key]) => key !== feedData.feedKey)
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        let currentTotal = totalEntries - existingFeedEntries;

        for (const [oldFeedKey, oldFeed] of sortedFeeds) {
          if (currentTotal + newFeedEntries <= MAX_TOTAL_ENTRIES) {
            break;
          }
          currentTotal -= oldFeed.entries?.length || 0;
          delete allFeeds[oldFeedKey];
        }

        const finalAvailableSpace = MAX_TOTAL_ENTRIES - currentTotal;
        if (newFeedEntries > finalAvailableSpace) {
          if (isUpdatingExisting && allFeeds[feedData.feedKey]) {
            delete allFeeds[feedData.feedKey];
          }

          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
          return;
        }
      }

      const feedKeys = Object.keys(allFeeds).filter((key) => key !== feedData.feedKey);
      if (feedKeys.length >= MAX_FEEDS && !isUpdatingExisting) {
        const sortedFeeds = feedKeys
          .map((key) => [key, allFeeds[key]] as [string, StoredFeedState])
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        if (sortedFeeds.length > 0) {
          const oldestKey = sortedFeeds[0][0];
          delete allFeeds[oldestKey];
        }
      }

      allFeeds[feedData.feedKey] = {
        feedKey: feedData.feedKey,
        entries: feedData.entries,
        scrollPosition,
        timestamp: Date.now(),
        hasMore: feedData.hasMore,
        page: feedData.page,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
    } catch (error) {
      // Silently fail - storage errors shouldn't break the app
    }
  };

  const getFeedState = (feedKey: string): StoredFeedState | null => {
    try {
      const allFeeds = getAllStoredFeeds();
      return allFeeds[feedKey] || null;
    } catch (error) {
      return null;
    }
  };

  const clearFeedState = (feedKey: string) => {
    try {
      const allFeeds = getAllStoredFeeds();
      if (allFeeds[feedKey]) {
        delete allFeeds[feedKey];
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
      }
    } catch (error) {
      // Silently fail - storage errors shouldn't break the app
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        isBackNavigation,
        resetBackNavigation,
        startTrackingFeed,
        stopTrackingFeed,
        saveFeedState,
        getFeedState,
        clearFeedState,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
