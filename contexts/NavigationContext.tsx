'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FeedEntry } from '@/types/feed';

// Feed state storage types and utilities
export interface FeedIdentifier {
  pathname: string; // e.g., "/", "/topic/neuroscience", "/latest"
  tab?: string; // e.g., "popular", "latest", "following"
  queryParams?: Record<string, string>; // e.g., { sort: "personalized", hubs: "1,2,3" }
}

export interface StoredFeedState {
  feedKey: string; // Unique feed identifier
  entries: FeedEntry[]; // Cap at 300 items
  scrollPosition: number; // Pixels from top
  timestamp: number; // When state was saved (for LRU eviction)
  hasMore?: boolean; // Whether there are more entries to load
  page?: number; // Current page number
}

export interface FeedStateData {
  feedKey: string; // pathname|tab:filters format
  entries: FeedEntry[]; // Up to 300 items
  scrollPosition: number; // window.scrollY
  hasMore?: boolean; // Whether there are more entries to load
  page?: number; // Current page number
}

// Storage constants
const STORAGE_KEY = 'rh_feed_states'; // Plural - stores multiple feeds
const MAX_TOTAL_ENTRIES = 200; // Total entries across all feeds
const MAX_FEEDS = 2;
const MIN_SCROLL_POSITION_TO_STORE = 500; // Don't store scroll position if less than this (user is near the top)

/**
 * Generate unique key for feed identification
 * Format: pathname|tab:tab|params:key1:value1,key2:value2
 */
export const getFeedKey = (id: FeedIdentifier): string => {
  const parts = [id.pathname];
  if (id.tab) parts.push(`tab:${id.tab}`);

  // Include query params in feed key if provided (sorted keys for consistency)
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
  // Feed state methods
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
    // Check performance API immediately
    const checkPerformanceAPI = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type === 'back_forward') {
        setIsBackNavigation(true);
      }
    };

    // Listen for popstate (browser back/forward button)
    const handlePopState = (event: PopStateEvent) => {
      setIsBackNavigation(true);
    };

    // Listen for pageshow (bfcache scenarios)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsBackNavigation(true);
      }
    };

    // Run initial check
    checkPerformanceAPI();

    // Add event listeners
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

  // Feed state management functions
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

    try {
      const allFeeds = getAllStoredFeeds();

      // Rule 4: If feed has more than 200 entries, don't store it at all
      if (feedData.entries.length > MAX_TOTAL_ENTRIES) {
        // Remove existing feed if it exists (don't restore position)
        if (allFeeds[feedData.feedKey]) {
          delete allFeeds[feedData.feedKey];
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
        }
        return;
      }

      // Calculate total entries across all feeds
      const totalEntries = Object.values(allFeeds).reduce(
        (sum, feed) => sum + (feed.entries?.length || 0),
        0
      );

      // Check if this is updating an existing feed or adding a new one
      const isUpdatingExisting = !!allFeeds[feedData.feedKey];
      const existingFeedEntries = isUpdatingExisting
        ? allFeeds[feedData.feedKey]?.entries?.length || 0
        : 0;

      // Calculate available space after removing existing feed entries
      const availableSpace = MAX_TOTAL_ENTRIES - (totalEntries - existingFeedEntries);
      const newFeedEntries = feedData.entries.length;

      // Rule 3: If not enough space, remove oldest feed(s) completely
      if (newFeedEntries > availableSpace) {
        // Remove oldest feed(s) until we have enough space
        const sortedFeeds = Object.entries(allFeeds)
          .filter(([key]) => key !== feedData.feedKey) // Don't remove the feed we're saving
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        let currentTotal = totalEntries - existingFeedEntries;

        // Remove oldest feeds until we have space
        for (const [oldFeedKey, oldFeed] of sortedFeeds) {
          if (currentTotal + newFeedEntries <= MAX_TOTAL_ENTRIES) {
            break;
          }
          currentTotal -= oldFeed.entries?.length || 0;
          delete allFeeds[oldFeedKey];
        }

        // Check if we have enough space after removing feeds
        const finalAvailableSpace = MAX_TOTAL_ENTRIES - currentTotal;
        if (newFeedEntries > finalAvailableSpace) {
          // Still not enough space, don't save
          // Remove existing feed if it exists
          if (isUpdatingExisting && allFeeds[feedData.feedKey]) {
            delete allFeeds[feedData.feedKey];
          }

          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
          return;
        }
      }

      // Rule 1: Enforce max 2 feeds
      const feedKeys = Object.keys(allFeeds).filter((key) => key !== feedData.feedKey);
      if (feedKeys.length >= MAX_FEEDS && !isUpdatingExisting) {
        // Remove oldest feed if we're at the limit
        const sortedFeeds = feedKeys
          .map((key) => [key, allFeeds[key]] as [string, StoredFeedState])
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        if (sortedFeeds.length > 0) {
          const oldestKey = sortedFeeds[0][0];
          delete allFeeds[oldestKey];
        }
      }

      // Don't store scroll position if less than MIN_SCROLL_POSITION_TO_STORE (user is near the top)
      const scrollPosition =
        feedData.scrollPosition < MIN_SCROLL_POSITION_TO_STORE ? 0 : feedData.scrollPosition;

      // Save the feed
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
