'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getEndaomentStatus,
  getEndaomentFunds,
  type EndaomentFund,
} from '@/services/endaoment.service';

interface EndaomentContextType {
  connected: boolean;
  endaomentUserId: string | null;
  isLoading: boolean;
  error: string | null;
  funds: EndaomentFund[];
  isFundsLoading: boolean;
  refetch: () => Promise<void>;
}

const EndaomentContext = createContext<EndaomentContextType>({
  connected: false,
  endaomentUserId: null,
  isLoading: true,
  error: null,
  funds: [],
  isFundsLoading: false,
  refetch: async () => {},
});

export function EndaomentProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [endaomentUserId, setEndaomentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<EndaomentFund[]>([]);
  const [isFundsLoading, setIsFundsLoading] = useState(false);

  const fetchFunds = useCallback(async () => {
    setIsFundsLoading(true);
    try {
      const result = await getEndaomentFunds();
      setFunds(result);
    } catch {
      // Funds fetch failure is non-critical; funds will remain empty
      setFunds([]);
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
      setEndaomentUserId(status.endaomentUserId);

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
        endaomentUserId,
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
