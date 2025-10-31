/**
 * Feed state storage utilities for maintaining feed position when navigating back
 */

import { FeedEntry } from '@/types/feed';

export interface FeedIdentifier {
  pathname: string; // e.g., "/", "/topic/neuroscience", "/latest"
  tab?: string; // e.g., "popular", "latest", "following"
  filters?: Record<string, any>; // Filter object (will be serialized)
}

export interface StoredFeedState {
  feedKey: string; // Unique feed identifier
  entries: FeedEntry[]; // Cap at 300 items
  scrollPosition: number; // Pixels from top
  timestamp: number; // When state was saved (for LRU eviction)
}

const STORAGE_KEY = 'rh_feed_states'; // Plural - stores multiple feeds
const MAX_ENTRIES_PER_FEED = 300;
const MAX_FEEDS = 2;

/**
 * Generate unique key for feed identification
 */
export const getFeedKey = (id: FeedIdentifier): string => {
  const parts = [id.pathname];
  if (id.tab) parts.push(`tab:${id.tab}`);
  if (id.filters) {
    // Sort filters for consistent key generation
    const sortedKeys = Object.keys(id.filters).sort();
    const filterStr = JSON.stringify(
      sortedKeys.reduce(
        (acc, key) => {
          acc[key] = id.filters![key];
          return acc;
        },
        {} as Record<string, any>
      )
    );
    parts.push(`f:${filterStr}`);
  }
  return parts.join('|');
};

// Storage constants exported for use in NavigationContext
export const STORAGE_KEY_FEEDS = STORAGE_KEY;
export const MAX_ENTRIES_PER_FEED_CONST = MAX_ENTRIES_PER_FEED;
export const MAX_FEEDS_CONST = MAX_FEEDS;
