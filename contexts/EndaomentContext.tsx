'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getEndaomentStatus,
  getEndaomentFunds,
  type EndaomentFund,
} from '@/services/endaoment.service';
import { ApiError } from '@/services/types';

interface EndaomentContextType {
  connected: boolean;
  isLoading: boolean;
  error: string | null;
  funds: EndaomentFund[];
  isFundsLoading: boolean;
  refetch: () => Promise<void>;
}

const EndaomentContext = createContext<EndaomentContextType>({
  connected: false,
  isLoading: true,
  error: null,
  funds: [],
  isFundsLoading: false,
  refetch: async () => {},
});

export function EndaomentProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<EndaomentFund[]>([]);
  const [isFundsLoading, setIsFundsLoading] = useState(false);

  const fetchFunds = useCallback(async () => {
    setIsFundsLoading(true);
    try {
      const result = await getEndaomentFunds();
      setFunds(result);
    } catch (err) {
      setFunds([]);
      // The backend drops a connection whose token Endaoment no longer
      // accepts and answers 404, so the user has to connect again.
      if (err instanceof ApiError && err.status === 404) {
        setConnected(false);
      }
    } finally {
      setIsFundsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getEndaomentStatus();
      setConnected(status.connected);

      // Fetch funds when connected
      if (status.connected) {
        await fetchFunds();
      } else {
        setFunds([]);
      }
    } catch {
      setError('Failed to fetch Endaoment status');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunds]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <EndaomentContext.Provider
      value={{
        connected,
        isLoading,
        error,
        funds,
        isFundsLoading,
        refetch,
      }}
    >
      {children}
    </EndaomentContext.Provider>
  );
}

export function useEndaoment() {
  const context = useContext(EndaomentContext);
  if (context === undefined) {
    throw new Error('useEndaoment must be used within an EndaomentProvider');
  }
  return context;
}
