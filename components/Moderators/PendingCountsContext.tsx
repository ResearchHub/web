'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  PendingModerationService,
  type PendingModuleCounts,
} from '@/services/content-moderation.service';
import { useUser } from '@/contexts/UserContext';

const PENDING_COUNTS_STALE_MS = 30_000;

type RefreshPendingCountsOptions = { force?: boolean };

interface PendingCountsValue {
  counts: PendingModuleCounts | null;
  totalCount: number;
  error: string | null;
  refreshPendingCounts: (options?: RefreshPendingCountsOptions) => Promise<void>;
}

const PendingCountsContext = createContext<PendingCountsValue | null>(null);

export function PendingCountsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isLoading: isUserLoading } = useUser();
  const [counts, setCounts] = useState<PendingModuleCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isModerator = !!user?.isModerator;
  const requestRef = useRef({
    id: 0,
    inFlight: null,
    fetchedAt: 0,
    failed: false,
  } as {
    id: number;
    inFlight: Promise<void> | null;
    fetchedAt: number;
    failed: boolean;
  });

  const refreshPendingCounts = useCallback(
    (options: RefreshPendingCountsOptions = {}) => {
      const force = options.force ?? false;
      const request = requestRef.current;

      if (!isModerator) {
        request.id += 1;
        request.inFlight = null;
        request.fetchedAt = 0;
        request.failed = false;
        setCounts(null);
        setError(null);
        return Promise.resolve();
      }

      const countsAreFresh = Date.now() - request.fetchedAt < PENDING_COUNTS_STALE_MS;
      if (!force && !request.failed && countsAreFresh) {
        return Promise.resolve();
      }

      if (!force && request.inFlight) {
        return request.inFlight;
      }

      const requestId = ++request.id;
      request.failed = false;
      setError(null);

      const inFlight = (async () => {
        try {
          const nextCounts = await PendingModerationService.fetchCounts();
          if (request.id !== requestId) return;

          request.fetchedAt = Date.now();
          setCounts(nextCounts);
        } catch (refreshError) {
          if (request.id !== requestId) return;

          request.failed = true;
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : 'Failed to fetch pending moderation counts'
          );
        } finally {
          if (request.id === requestId) {
            request.inFlight = null;
          }
        }
      })();

      request.inFlight = inFlight;
      return inFlight;
    },
    [isModerator]
  );

  const totalCount = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : 0;

  useEffect(() => {
    if (isUserLoading) return;

    void refreshPendingCounts({ force: true });
  }, [isUserLoading, refreshPendingCounts]);

  return (
    <PendingCountsContext.Provider value={{ counts, totalCount, error, refreshPendingCounts }}>
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
