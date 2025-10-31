'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FeedEntry } from '@/types/feed';
import { getFeedKey, FeedIdentifier, StoredFeedState } from '@/utils/feedStateStorage';
import {
  STORAGE_KEY_FEEDS,
  MAX_ENTRIES_PER_FEED_CONST,
  MAX_FEEDS_CONST,
} from '@/utils/feedStateStorage';

export interface FeedStateData {
  feedKey: string; // pathname|tab:filters format
  entries: FeedEntry[]; // Up to 300 items
  scrollPosition: number; // window.scrollY
}

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
  const trackingCountRef = useRef(0); // Track how many components are tracking

  useEffect(() => {
    console.log('🔍 NavigationProvider: Setting up back navigation detection');

    // Check performance API immediately
    const checkPerformanceAPI = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation?.type === 'back_forward') {
        console.log('🔍 Performance API detected back navigation');
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
    console.log('🔍 Resetting back navigation flag');
    setIsBackNavigation(false);
  };

  // Feed state management functions
  const getAllStoredFeeds = (): Record<string, StoredFeedState> => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_FEEDS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to get stored feeds:', error);
      return {};
    }
  };

  const startTrackingFeed = () => {
    trackingCountRef.current += 1;
    console.log('📊 Started tracking feed, count:', trackingCountRef.current);
  };

  const stopTrackingFeed = () => {
    trackingCountRef.current = Math.max(0, trackingCountRef.current - 1);
    console.log('📊 Stopped tracking feed, count:', trackingCountRef.current);
  };

  const isTracking = () => trackingCountRef.current > 0;

  const saveFeedState = (feedData: FeedStateData) => {
    if (!isTracking()) {
      console.log('📊 Not saving feed state - tracking not active');
      return;
    }

    try {
      console.log('💾 Saving feed state:', feedData.feedKey);
      const allFeeds = getAllStoredFeeds();
      const feedCount = Object.keys(allFeeds).length;

      // If at limit and this is a new feed key, remove oldest
      if (feedCount >= MAX_FEEDS_CONST && !allFeeds[feedData.feedKey]) {
        const oldestEntry = Object.entries(allFeeds).sort(
          (a, b) => a[1].timestamp - b[1].timestamp
        )[0];
        console.log('💾 Evicting oldest feed:', oldestEntry[0]);
        delete allFeeds[oldestEntry[0]];
      }

      // Cap entries to MAX_ENTRIES_PER_FEED
      const entries = feedData.entries.slice(0, MAX_ENTRIES_PER_FEED_CONST);

      allFeeds[feedData.feedKey] = {
        feedKey: feedData.feedKey,
        entries,
        scrollPosition: feedData.scrollPosition,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(allFeeds));
      console.log('💾 Feed state saved successfully');
    } catch (error) {
      console.error('💾 Failed to save feed state:', error);
    }
  };

  const getFeedState = (feedKey: string): StoredFeedState | null => {
    try {
      const allFeeds = getAllStoredFeeds();
      const state = allFeeds[feedKey];
      if (state) {
        console.log('📖 Found saved feed state for:', feedKey);
        return state;
      }
      console.log('📖 No saved feed state found for:', feedKey);
      return null;
    } catch (error) {
      console.error('📖 Failed to get feed state:', error);
      return null;
    }
  };

  const clearFeedState = (feedKey: string) => {
    try {
      const allFeeds = getAllStoredFeeds();
      if (allFeeds[feedKey]) {
        delete allFeeds[feedKey];
        sessionStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(allFeeds));
        console.log('🗑️ Cleared feed state for:', feedKey);
      }
    } catch (error) {
      console.warn('Failed to clear feed state:', error);
    }
  };

  console.log('🔍 NavigationProvider: isBackNavigation =', isBackNavigation);

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
