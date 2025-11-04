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
const MAX_ENTRIES_PER_FEED = 300;
const MAX_FEEDS = 2;

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
    console.log('[NavigationContext] saveFeedState called', {
      feedKey: feedData.feedKey,
      entriesLength: feedData.entries.length,
      scrollPosition: feedData.scrollPosition,
      hasMore: feedData.hasMore,
      page: feedData.page,
      isTracking: isTrackingRef.current,
    });

    if (!isTrackingRef.current) {
      console.log('[NavigationContext] saveFeedState skipped (not tracking)');
      return;
    }

    try {
      const allFeeds = getAllStoredFeeds();
      const feedCount = Object.keys(allFeeds).length;

      console.log('[NavigationContext] current stored feeds', {
        feedCount,
        feedKeys: Object.keys(allFeeds),
      });

      // If at limit and this is a new feed key, remove oldest
      if (feedCount >= MAX_FEEDS && !allFeeds[feedData.feedKey]) {
        const oldestEntry = Object.entries(allFeeds).sort(
          (a, b) => a[1].timestamp - b[1].timestamp
        )[0];
        console.log('[NavigationContext] removing oldest feed', {
          oldestKey: oldestEntry[0],
          timestamp: oldestEntry[1].timestamp,
        });
        delete allFeeds[oldestEntry[0]];
      }

      // Cap entries to MAX_ENTRIES_PER_FEED
      const entries = feedData.entries.slice(0, MAX_ENTRIES_PER_FEED);

      // Don't store scroll position if less than 100px (user is near the top)
      const scrollPosition = feedData.scrollPosition < 100 ? 0 : feedData.scrollPosition;

      allFeeds[feedData.feedKey] = {
        feedKey: feedData.feedKey,
        entries,
        scrollPosition,
        timestamp: Date.now(),
        hasMore: feedData.hasMore,
        page: feedData.page,
      };

      console.log('[NavigationContext] saving feed state', {
        feedKey: feedData.feedKey,
        entriesLength: entries.length,
        scrollPosition,
        hasMore: feedData.hasMore,
        page: feedData.page,
        allFeedKeys: Object.keys(allFeeds),
      });

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(allFeeds));
    } catch (error) {
      console.error('[NavigationContext] error saving feed state', error);
      // Silently fail - storage errors shouldn't break the app
    }
  };

  const getFeedState = (feedKey: string): StoredFeedState | null => {
    try {
      const allFeeds = getAllStoredFeeds();
      console.log('[NavigationContext] getFeedState called', {
        feedKey,
        allFeedKeys: Object.keys(allFeeds),
        hasFeed: !!allFeeds[feedKey],
      });
      const state = allFeeds[feedKey] || null;
      if (state) {
        console.log('[NavigationContext] found feed state', {
          feedKey,
          entriesLength: state.entries?.length || 0,
          scrollPosition: state.scrollPosition,
          page: state.page,
          hasMore: state.hasMore,
        });
      } else {
        console.log('[NavigationContext] feed state not found', { feedKey });
      }
      return state;
    } catch (error) {
      console.error('[NavigationContext] error getting feed state', error);
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
