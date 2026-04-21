'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { FeedEntry } from '@/types/feed';

export type GrantBannerTab = 'proposals' | 'details' | 'activity';

interface GrantTabContextValue {
  activeTab: GrantBannerTab;
  setActiveTab: (tab: GrantBannerTab) => void;
  activity: {
    entries: FeedEntry[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    count: number;
    loadMore: () => void;
  };
}

const GrantTabContext = createContext<GrantTabContextValue | null>(null);

export function useGrantTab() {
  const ctx = useContext(GrantTabContext);
  if (!ctx) throw new Error('useGrantTab must be used within GrantTabProvider');
  return ctx;
}

export function GrantTabProvider({
  children,
  defaultTab = 'details',
  grantId,
}: {
  children: ReactNode;
  defaultTab?: GrantBannerTab;
  grantId?: number | string;
}) {
  const [activeTab, setActiveTab] = useState<GrantBannerTab>(defaultTab);
  const { entries, isLoading, isLoadingMore, hasMore, count, loadMore } = useActivityFeed({
    scope: 'grants',
    grantId,
  });

  return (
    <GrantTabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activity: { entries, isLoading, isLoadingMore, hasMore, count, loadMore },
      }}
    >
      {children}
    </GrantTabContext.Provider>
  );
}
