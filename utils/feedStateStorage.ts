/**
 * Feed state storage utilities for maintaining feed position when navigating back
 */

import { FeedEntry } from '@/types/feed';

export interface FeedIdentifier {
  pathname: string; // e.g., "/", "/topic/neuroscience", "/latest"
  tab?: string; // e.g., "popular", "latest", "following"
  filters?: string; // Serialized filter hash (optional)
}

export interface StoredFeedState {
  feedKey: string; // Unique feed identifier
  entries: FeedEntry[]; // Cap at 200 items
  scrollPosition: number; // Pixels from top
  hasMore: boolean; // Pagination state
  page: number; // Current page number
  timestamp: number; // When state was saved
  tab?: string; // Active tab
  filters?: any; // Current filters (optional)
}

const STORAGE_KEY = 'rh_feed_state';
const MAX_ENTRIES = 200;
const STATE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Generate unique key for feed identification
 */
export const getFeedKey = (id: FeedIdentifier): string => {
  const parts = [id.pathname];
  if (id.tab) parts.push(`tab:${id.tab}`);
  if (id.filters) parts.push(`f:${id.filters}`);
  return parts.join('|');
};

/**
 * Save feed state to sessionStorage
 */
export const saveFeedState = (state: Omit<StoredFeedState, 'timestamp'>) => {
  try {
    console.log('💾 saveFeedState called with:', state);
    const feedState: StoredFeedState = {
      ...state,
      entries: state.entries.slice(0, MAX_ENTRIES), // Cap at 200 items
      timestamp: Date.now(),
    };

    console.log('💾 Saving state to sessionStorage:', feedState);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(feedState));
    console.log('💾 Feed state saved successfully');
  } catch (error) {
    console.error('💾 Failed to save feed state:', error);
  }
};

/**
 * Get saved feed state from sessionStorage
 */
export const getSavedFeedState = (): StoredFeedState | null => {
  try {
    console.log('📖 getSavedFeedState called');
    const stored = sessionStorage.getItem(STORAGE_KEY);
    console.log('📖 Raw stored data:', stored);

    if (!stored) {
      console.log('📖 No stored state found');
      return null;
    }

    const state: StoredFeedState = JSON.parse(stored);
    console.log('📖 Parsed state:', state);

    // Check if state is stale
    const isStale = Date.now() - state.timestamp > STATE_TTL;
    console.log('📖 State is stale:', isStale);

    if (isStale) {
      console.log('📖 State is stale, clearing it');
      clearFeedState();
      return null;
    }

    console.log('📖 Returning valid saved state');
    return state;
  } catch (error) {
    console.error('📖 Failed to get saved feed state:', error);
    return null;
  }
};

/**
 * Clear saved feed state
 */
export const clearFeedState = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear feed state:', error);
  }
};

/**
 * Check if saved state should be cleared
 */
export const shouldClearState = (savedState: StoredFeedState, currentFeedKey: string): boolean => {
  const isStale = Date.now() - savedState.timestamp > STATE_TTL;
  const isDifferentFeed = savedState.feedKey !== currentFeedKey;
  return isStale || isDifferentFeed;
};

/**
 * Detect if this is a back navigation
 */
export const isBackNavigation = (): boolean => {
  try {
    // Check performance navigation API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation?.type === 'back_forward') {
      return true;
    }

    // Fallback: check if we have saved state (indicates potential back navigation)
    return getSavedFeedState() !== null;
  } catch (error) {
    console.warn('Failed to detect back navigation:', error);
    return false;
  }
};
