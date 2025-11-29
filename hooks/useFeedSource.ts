'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { FeedSource } from '@/types/analytics';

/**
 * Custom hook that extracts feed source and tab information from the current URL.
 *
 * This hook analyzes the URL pathname and search parameters to determine:
 * 1. The feed source (home, earn, fund, journal, topic, author, search, or unknown)
 * 2. The specific tab or section within that source
 *
 * Tab extraction follows this priority order:
 * 1. Query parameter 'tab' (e.g., ?tab=active)
 * 2. Third path segment for topic pages (e.g., /topic/ai/popular → tab: 'popular')
 * 3. Second path segment (e.g., /earn/grants)
 * 4. For home tabs, the source itself (e.g., /trending → tab: 'trending')
 * 5. Default to 'unknown'
 *
 * Special handling:
 * - Root path (/) is treated as 'home' source
 * - trending, following, latest, for-you are all treated as 'home' source
 * - Topic pages (/topic/slug/tab) use the third path segment as tab
 * - Author pages (/author/[id]) don't use the second path segment as tab
 * - Search pages (/search) use 'search' as tab (no extraction needed)
 *
 * URL Structure Examples:
 * - /trending → source: 'home', tab: 'trending'
 * - /following → source: 'home', tab: 'following'
 * - /latest → source: 'home', tab: 'latest'
 * - /for-you → source: 'home', tab: 'for-you'
 * - /earn → source: 'earn', tab: 'unknown'
 * - /fund → source: 'fund', tab: 'unknown'
 * - /journal?tab=all → source: 'journal', tab: 'all'
 * - /topic/ai/popular → source: 'topic', tab: 'popular'
 * - /topic/ai/latest → source: 'topic', tab: 'latest'
 * - /fund/needs-funding → source: 'fund', tab: 'needs-funding'
 * - /author/153397?tab=contributions → source: 'author', tab: 'contributions'
 * - /search?q=ai → source: 'search', tab: 'search'
 */

export interface FeedSourceInfo {
  source: FeedSource;
  tab: string;
}

/**
 * Type guard to validate if a string is a valid FeedSource.
 * @param source - The string to validate
 * @returns true if the source is a valid FeedSource, false otherwise
 */
function isValidFeedSource(source: string): source is FeedSource {
  const validSources: FeedSource[] = [
    'home',
    'earn',
    'fund',
    'journal',
    'topic',
    'author',
    'search',
  ];
  return validSources.includes(source as FeedSource);
}

/**
 * Converts a string to a FeedSource, defaulting to 'unknown' if invalid.
 * @param source - The string to convert
 * @returns A valid FeedSource or 'unknown'
 */
function toFeedSource(source: string): FeedSource {
  return isValidFeedSource(source) ? source : 'unknown';
}

/**
 * Custom hook that extracts feed source and tab information from the current URL.
 *
 * @returns FeedSourceInfo object containing source and tab information
 */
export function useFeedSource(): FeedSourceInfo {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Extract source from first path segment
  const source = pathSegments[0] || 'home';

  // Treat trending, following, latest, for-you as home
  const homeTabs = ['trending', 'following', 'latest', 'for-you'];
  const isHomeTab = homeTabs.includes(source);
  const isTopicTab = source === 'topic';
  const isAuthorTab = source === 'author';
  const isSearchTab = source === 'search';

  const feedSource = isHomeTab ? 'home' : toFeedSource(source);

  // Extract tab: 1) query param, 2) third path segment for topic pages, 3) second path segment, 4) home tab, 5) search (constant), 6) unknown
  let tab: string;

  const queryTab = searchParams.get('tab');
  const pathTab = pathSegments[1];
  const topicTab = pathSegments[2];

  if (queryTab) {
    tab = queryTab;
  } else if (isSearchTab) {
    // For search, use constant 'search' as tab (no extraction needed)
    tab = 'search';
  } else if (isTopicTab && topicTab) {
    tab = topicTab;
  } else if (pathTab && !isTopicTab && !isAuthorTab) {
    tab = pathTab;
  } else if (isHomeTab) {
    // For home tabs, use the source as the tab
    tab = source;
  } else {
    tab = 'unknown';
  }

  return {
    source: feedSource,
    tab,
  };
}
