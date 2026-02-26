'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { GrantService } from '@/services/grant.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

interface GrantContextValue {
  grants: FeedEntry[];
  selectedGrant: FeedEntry | null;
  isLoading: boolean;
  error: string | null;
  /** Lazy fetch -- only fires one API call, then caches. Safe to call repeatedly. */
  fetchGrants: () => Promise<void>;
  /** Seed grants from SSR data without triggering a fetch */
  setInitialGrants: (grants: FeedEntry[]) => void;
  selectGrant: (grantId: number | string | null) => void;
  getGrantById: (grantId: number | string) => FeedEntry | undefined;
  refresh: () => Promise<void>;
}

const GrantContext = createContext<GrantContextValue | null>(null);

interface GrantProviderProps {
  children: ReactNode;
}

export function GrantProvider({ children }: GrantProviderProps) {
  const [grants, setGrants] = useState<FeedEntry[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<FeedEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDataRef = useRef(false);

  const fetchGrants = useCallback(async () => {
    if (hasDataRef.current) return;
    hasDataRef.current = true;

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

  const setInitialGrants = useCallback((initialGrants: FeedEntry[]) => {
    if (hasDataRef.current) return;
    hasDataRef.current = true;
    setGrants(initialGrants);
  }, []);

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
    hasDataRef.current = false;
    await fetchGrants();
  }, [fetchGrants]);

  return (
    <GrantContext.Provider
      value={{
        grants,
        selectedGrant,
        isLoading,
        error,
        fetchGrants,
        setInitialGrants,
        selectGrant,
        getGrantById,
        refresh,
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
