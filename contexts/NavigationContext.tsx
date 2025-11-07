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
  timestamp?: number; // Added automatically when saving
  hasMore?: boolean;
  page?: number;
  lastClickedEntryId?: string; // Added automatically when saving
}

const STORAGE_KEY = 'rh_feed_states';
const MAX_TOTAL_ENTRIES = 200;
const MAX_FEEDS = 2;
const MIN_SCROLL_POSITION_TO_STORE = 250;

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
  startTrackingFeed: (minScrollPosition?: number) => void;
  stopTrackingFeed: () => void;
  saveFeedState: (feedData: StoredFeedState) => void;
  getFeedState: (feedKey: string) => StoredFeedState | null;
  clearFeedState: (feedKey: string) => void;
  updateLastClickedEntryId: (entryId: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isBackNavigation: false,
  resetBackNavigation: () => {},
  startTrackingFeed: () => {},
  stopTrackingFeed: () => {},
  saveFeedState: () => {},
  getFeedState: () => null,
  clearFeedState: () => {},
  updateLastClickedEntryId: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isBackNavigation, setIsBackNavigation] = useState(false);
  const isTrackingRef = useRef(false);
  const minScrollPositionRef = useRef<number>(MIN_SCROLL_POSITION_TO_STORE);
  // Store last clicked entry IDs in context state (feedKey -> entryId)
  const lastClickedEntryIdsRef = useRef<string | null>(null);

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

  const startTrackingFeed = (minScrollPosition?: number) => {
    isTrackingRef.current = true;
    if (minScrollPosition !== undefined) {
      minScrollPositionRef.current = minScrollPosition;
    } else {
      minScrollPositionRef.current = MIN_SCROLL_POSITION_TO_STORE;
    }
  };

  const stopTrackingFeed = () => {
    isTrackingRef.current = false;
  };

  const saveFeedState = (feedData: StoredFeedState) => {
    try {
      const allFeeds = getAllStoredFeeds();

      // Remove existing feed data first (cleanup on unmount)
      if (allFeeds[feedData.feedKey]) {
        delete allFeeds[feedData.feedKey];
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
      }

      // If not tracking, don't save (already removed above)
      if (!isTrackingRef.current) {
        return;
      }

      // If no entries, don't save (already removed above)
      if (feedData.entries.length === 0) {
        return;
      }

      const minScrollPosition = minScrollPositionRef.current;
      const scrollPosition =
        feedData.scrollPosition < minScrollPosition ? 0 : feedData.scrollPosition;

      // If scroll position is 0, don't save (already removed above)
      if (scrollPosition === 0) {
        return;
      }

      // If entries exceed max, don't save (already removed above)
      if (feedData.entries.length > MAX_TOTAL_ENTRIES) {
        return;
      }

      // Calculate available space
      const totalEntries = Object.values(allFeeds).reduce(
        (sum, feed) => sum + (feed.entries?.length || 0),
        0
      );

      const availableSpace = MAX_TOTAL_ENTRIES - totalEntries;
      const newFeedEntries = feedData.entries.length;

      if (newFeedEntries > availableSpace) {
        const sortedFeeds = Object.entries(allFeeds).sort(
          (a, b) => (a[1].timestamp ?? 0) - (b[1].timestamp ?? 0)
        );

        let currentTotal = totalEntries;

        for (const [oldFeedKey, oldFeed] of sortedFeeds) {
          if (currentTotal + newFeedEntries <= MAX_TOTAL_ENTRIES) {
            break;
          }
          currentTotal -= oldFeed.entries?.length || 0;
          delete allFeeds[oldFeedKey];
        }

        const finalAvailableSpace = MAX_TOTAL_ENTRIES - currentTotal;
        if (newFeedEntries > finalAvailableSpace) {
          // Already removed above, just save the cleaned state
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
          return;
        }
      }

      const feedKeys = Object.keys(allFeeds);
      if (feedKeys.length >= MAX_FEEDS) {
        const sortedFeeds = feedKeys
          .map((key) => [key, allFeeds[key]] as [string, StoredFeedState])
          .sort((a, b) => (a[1].timestamp ?? 0) - (b[1].timestamp ?? 0));

        if (sortedFeeds.length > 0) {
          const oldestKey = sortedFeeds[0][0];
          delete allFeeds[oldestKey];
        }
      }

      // Save the feed data
      allFeeds[feedData.feedKey] = {
        ...feedData,
        scrollPosition,
        timestamp: feedData.timestamp ?? Date.now(),
        lastClickedEntryId:
          feedData.lastClickedEntryId ?? lastClickedEntryIdsRef.current ?? undefined,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));

      // Clear the ref after saving it to the feed entry
      lastClickedEntryIdsRef.current = null;
    } catch (error) {
      // Silently fail - storage errors shouldn't break the app
    }
  };

  const updateLastClickedEntryId = (entryId: string) => {
    lastClickedEntryIdsRef.current = entryId;
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
        updateLastClickedEntryId,
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
