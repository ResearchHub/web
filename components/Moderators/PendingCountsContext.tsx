'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  PendingModerationService,
  type PendingModuleCounts,
} from '@/services/pending-moderation.service';

interface PendingCountsValue {
  counts: PendingModuleCounts | null;
  refresh: () => void;
}

const PendingCountsContext = createContext<PendingCountsValue | null>(null);

export function PendingCountsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [counts, setCounts] = useState<PendingModuleCounts | null>(null);

  const refresh = useCallback(() => {
    // Badges are a non-critical enhancement: on failure keep the last-known counts.
    PendingModerationService.fetchCounts()
      .then(setCounts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PendingCountsContext.Provider value={{ counts, refresh }}>
      {children}
    </PendingCountsContext.Provider>
  );
}

export function usePendingCounts(): PendingCountsValue {
  const context = useContext(PendingCountsContext);
  if (!context) {
    throw new Error('usePendingCounts must be used within a PendingCountsProvider');
  }
  return context;
}
