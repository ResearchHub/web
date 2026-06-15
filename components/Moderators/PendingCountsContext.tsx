'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import {
  PendingModerationService,
  type PendingModuleCounts,
} from '@/services/content-moderation.service';
import { useUser } from '@/contexts/UserContext';

type RefreshPendingCountsOptions = { force?: boolean };

interface PendingCountsState {
  counts: PendingModuleCounts | null;
  totalCount: number;
  error: string | null;
}

interface PendingCountsValue extends PendingCountsState {
  refreshPendingCounts: (options?: RefreshPendingCountsOptions) => Promise<void>;
}

type PendingCountsAction =
  | { type: 'reset' }
  | { type: 'clear-error' }
  | { type: 'set-counts'; counts: PendingModuleCounts }
  | { type: 'set-error'; error: string };

interface PendingCountsRequest {
  id: number;
  inFlight: Promise<void> | null;
  hasLoaded: boolean;
}

const INITIAL_PENDING_COUNTS_STATE: PendingCountsState = {
  counts: null,
  totalCount: 0,
  error: null,
};

const PendingCountsStateContext = createContext<PendingCountsState | null>(null);
const RefreshPendingCountsContext = createContext<
  PendingCountsValue['refreshPendingCounts'] | null
>(null);

function sumPendingCounts(counts: PendingModuleCounts): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function pendingCountsReducer(
  state: PendingCountsState,
  action: PendingCountsAction
): PendingCountsState {
  switch (action.type) {
    case 'reset':
      return INITIAL_PENDING_COUNTS_STATE;
    case 'clear-error':
      return state.error ? { ...state, error: null } : state;
    case 'set-counts':
      return {
        counts: action.counts,
        totalCount: sumPendingCounts(action.counts),
        error: null,
      };
    case 'set-error':
      return { ...state, error: action.error };
  }
}

export function PendingCountsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isLoading: isUserLoading } = useUser();
  const [state, dispatch] = useReducer(pendingCountsReducer, INITIAL_PENDING_COUNTS_STATE);
  const isModerator = !!user?.isModerator;
  // Tracks in-flight de-duping and latest-response wins.
  const requestRef = useRef<PendingCountsRequest>({
    id: 0,
    inFlight: null,
    hasLoaded: false,
  });

  const refreshPendingCounts = useCallback(
    (options: RefreshPendingCountsOptions = {}) => {
      const force = options.force ?? false;
      const request = requestRef.current;

      if (!isModerator) {
        request.id += 1;
        request.inFlight = null;
        request.hasLoaded = false;
        dispatch({ type: 'reset' });
        return Promise.resolve();
      }

      if (!force && request.hasLoaded) {
        return Promise.resolve();
      }

      if (!force && request.inFlight) {
        return request.inFlight;
      }

      const requestId = ++request.id;
      dispatch({ type: 'clear-error' });

      const inFlight = (async () => {
        try {
          const nextCounts = await PendingModerationService.fetchCounts();
          if (request.id !== requestId) return;

          request.hasLoaded = true;
          dispatch({ type: 'set-counts', counts: nextCounts });
        } catch (refreshError) {
          if (request.id !== requestId) return;

          dispatch({
            type: 'set-error',
            error:
              refreshError instanceof Error
                ? refreshError.message
                : 'Failed to fetch pending moderation counts',
          });
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

  useEffect(() => {
    if (isUserLoading) return;

    refreshPendingCounts().catch(() => undefined);
  }, [isUserLoading, refreshPendingCounts]);

  return (
    <RefreshPendingCountsContext.Provider value={refreshPendingCounts}>
      <PendingCountsStateContext.Provider value={state}>
        {children}
      </PendingCountsStateContext.Provider>
    </RefreshPendingCountsContext.Provider>
  );
}

export function usePendingCounts(): PendingCountsValue {
  const state = useContext(PendingCountsStateContext);
  const refreshPendingCounts = useContext(RefreshPendingCountsContext);
  if (!state || !refreshPendingCounts) {
    throw new Error('usePendingCounts must be used within a PendingCountsProvider');
  }
  return { ...state, refreshPendingCounts };
}
