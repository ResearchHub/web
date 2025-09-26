'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { FeedSource } from '@/types/analytics';

export interface FeedSourceInfo {
  source: FeedSource;
  tab: string;
}

function isValidFeedSource(source: string): source is FeedSource {
  const validSources: FeedSource[] = ['home', 'earn', 'fund', 'journal', 'topic'];
  return validSources.includes(source as FeedSource);
}

function toFeedSource(source: string): FeedSource {
  return isValidFeedSource(source) ? source : 'unknown';
}

export function useFeedSource(): FeedSourceInfo {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Extract source from first path segment
  const source = pathSegments[0] || 'home';

  // Treat trending, following, latest as home
  const homeTabs = ['trending', 'following', 'latest'];
  const isHomeTab = homeTabs.includes(source);
  const isTopicTab = source === 'topic';

  const feedSource = isHomeTab ? 'home' : toFeedSource(source);

  // Extract tab: 1) query param, 2) second path segment, 3) home tab, 4) unknown
  let tab: string;

  const queryTab = searchParams.get('tab');
  const pathTab = pathSegments[1];

  if (queryTab) {
    tab = queryTab;
  } else if (pathTab && !isTopicTab) {
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
