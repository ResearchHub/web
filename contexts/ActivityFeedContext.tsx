'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { useActivityFeed } from '@/hooks/useActivityFeed';

function isDisableCacheParam(value: string | null): boolean {
  return value === 'true' || value === '1';
}

type ActivityFeedHookValue = ReturnType<typeof useActivityFeed>;

interface ActivityFeedContextValue extends ActivityFeedHookValue {
  activate: () => void;
  /**
   * Whether this feed ever had a saved scroll position to return to. Unlike
   * `restoredScrollPosition`, which is consumed and reverts to null, this stays
   * true, so callers can tell a restored feed apart from a fresh visit at any
   * point in the provider's life.
   */
  hasSavedScrollPosition: boolean;
}

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null);

/**
 * Homepage Activity feed. Stays mounted across home tab switches so we only
 * refetch when the provider remounts (leave home) or after back-nav restore.
 * Starts with `enabled: false` until `activate()` on first Activity tab visit.
 */
export function ActivityFeedProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const disableCache = isDisableCacheParam(searchParams.get('disable_cache'));

  const [enabled, setEnabled] = useState(false);
  const activate = useCallback(() => setEnabled(true), []);
  const feed = useActivityFeed({ enabled, disableCache });

  // `restoredScrollPosition` only survives until useFeedScrollTracking consumes
  // it and clears the back-navigation flag, after which a restored feed is
  // indistinguishable from a fresh one. Latch it instead of re-reading it.
  const [hasSavedScrollPosition, setHasSavedScrollPosition] = useState(
    feed.restoredScrollPosition !== null
  );

  useEffect(() => {
    if (feed.restoredScrollPosition !== null) {
      setHasSavedScrollPosition(true);
    }
  }, [feed.restoredScrollPosition]);

  const value: ActivityFeedContextValue = {
    ...feed,
    activate,
    hasSavedScrollPosition,
  };

  return <ActivityFeedContext.Provider value={value}>{children}</ActivityFeedContext.Provider>;
}

/** Shared homepage activity feed (distinct from the parameterized `useActivityFeed` hook). */
export function useActivityFeeds() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useActivityFeeds must be used within an ActivityFeedProvider');
  }
  return context;
}
