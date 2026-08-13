'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { FeedEntry } from '@/types/feed';
import { useActivityFeed } from '@/hooks/useActivityFeed';

interface ActivityFeedContextValue {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  activate: () => void;
  restoredScrollPosition: number | null;
  lastClickedEntryId: string | null;
  restorationTab: string;
}

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null);

/**
 * Homepage Activity feed. Stays mounted across home tab switches so we only
 * refetch when the provider remounts (leave home) or after back-nav restore.
 */
export function ActivityFeedProvider({ children }: { children: ReactNode }) {
  const [activated, setActivated] = useState(false);
  const activate = useCallback(() => setActivated(true), []);

  const feed = useActivityFeed({ enabled: activated });

  if (!activated && feed.entries.length > 0) {
    setActivated(true);
  }

  const value = useMemo<ActivityFeedContextValue>(
    () => ({
      entries: feed.entries,
      isLoading: !activated || feed.isLoading,
      isLoadingMore: feed.isLoadingMore,
      hasMore: feed.hasMore,
      page: feed.page,
      loadMore: feed.loadMore,
      activate,
      restoredScrollPosition: feed.restoredScrollPosition,
      lastClickedEntryId: feed.lastClickedEntryId,
      restorationTab: feed.restorationTab,
    }),
    [
      feed.entries,
      activated,
      feed.isLoading,
      feed.isLoadingMore,
      feed.hasMore,
      feed.page,
      feed.loadMore,
      activate,
      feed.restoredScrollPosition,
      feed.lastClickedEntryId,
      feed.restorationTab,
    ]
  );

  return <ActivityFeedContext.Provider value={value}>{children}</ActivityFeedContext.Provider>;
}

/** Shared homepage activity feed (distinct from the parameterized `useActivityFeed` hook). */
export function useHomeActivityFeed() {
  const context = useContext(ActivityFeedContext);
  if (!context) {
    throw new Error('useHomeActivityFeed must be used within an ActivityFeedProvider');
  }
  return context;
}
