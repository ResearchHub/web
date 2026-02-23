'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { GrantService } from '@/services/grant.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

interface GrantContextValue {
  /** All open grants fetched from the API */
  grants: FeedEntry[];
  /** Currently selected grant (for /funding/[grantId] pages) */
  selectedGrant: FeedEntry | null;
  /** Loading state for initial grants fetch */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Select a grant by its ID */
  selectGrant: (grantId: number | string | null) => void;
  /** Get a grant by ID from the cached grants */
  getGrantById: (grantId: number | string) => FeedEntry | undefined;
  /** Refresh grants data */
  refresh: () => Promise<void>;
  /** Trigger initial fetch (for lazy loading when provider is global) */
  ensureLoaded: () => void;
}

const GrantContext = createContext<GrantContextValue | null>(null);

interface GrantProviderProps {
  children: ReactNode;
  /** Initial grants from server-side fetch (for static rendering) */
  initialGrants?: FeedEntry[];
  /** Optional initial selected grant for server-side rendered pages */
  initialGrant?: FeedEntry | null;
}

export function GrantProvider({ children, initialGrants, initialGrant }: GrantProviderProps) {
  const [grants, setGrants] = useState<FeedEntry[]>(initialGrants || []);
  const [selectedGrant, setSelectedGrant] = useState<FeedEntry | null>(initialGrant || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAttemptedRef = useRef(!!initialGrants && initialGrants.length > 0);

  const fetchGrants = useCallback(async () => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const result = await GrantService.getGrants({
        page: 1,
        pageSize: 20,
        status: 'OPEN',
        ordering: 'most_applicants',
      });

      setGrants(result.grants);
    } catch (err) {
      console.error('Failed to fetch grants:', err);
      setError('Failed to load funding opportunities.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureLoaded = useCallback(() => {
    if (!hasAttemptedRef.current) {
      fetchGrants();
    }
  }, [fetchGrants]);

  // Auto-fetch when initialGrants are provided (SSR hydration path)
  useEffect(() => {
    if (initialGrants && initialGrants.length > 0) return;
    // Don't auto-fetch when used as a global provider (no initialGrants)
    // Consumers call ensureLoaded() to trigger the fetch lazily
  }, [fetchGrants, initialGrants]);

  const getGrantById = useCallback(
    (grantId: number | string): FeedEntry | undefined => {
      const id = Number(grantId);
      return grants.find((grant) => {
        const content = grant.content as FeedGrantContent;
        return content.grant?.id === id || content.id === id;
      });
    },
    [grants]
  );

  const selectGrant = useCallback(
    (grantId: number | string | null) => {
      if (grantId === null) {
        setSelectedGrant(null);
        return;
      }

      const grant = getGrantById(grantId);
      if (grant) {
        setSelectedGrant(grant);
      }
    },
    [getGrantById]
  );

  const refresh = useCallback(async () => {
    hasAttemptedRef.current = false;
    await fetchGrants();
  }, [fetchGrants]);

  return (
    <GrantContext.Provider
      value={{
        grants,
        selectedGrant,
        isLoading,
        error,
        selectGrant,
        getGrantById,
        refresh,
        ensureLoaded,
      }}
    >
      {children}
    </GrantContext.Provider>
  );
}

export function useGrants() {
  const context = useContext(GrantContext);
  if (!context) {
    throw new Error('useGrants must be used within a GrantProvider');
  }
  return context;
}

/** Safe version that returns null outside the provider (e.g. TopBar before GrantProvider mounts) */
export function useGrantsOptional(): GrantContextValue | null {
  return useContext(GrantContext);
}
