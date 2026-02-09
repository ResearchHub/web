'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getEndaomentStatus } from '@/services/endaoment.service';

interface EndaomentContextType {
  connected: boolean;
  endaomentUserId: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const EndaomentContext = createContext<EndaomentContextType>({
  connected: false,
  endaomentUserId: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
});

export function EndaomentProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [endaomentUserId, setEndaomentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getEndaomentStatus();
      setConnected(status.connected);
      setEndaomentUserId(status.endaomentUserId);
    } catch {
      setError('Failed to fetch Endaoment status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <EndaomentContext.Provider value={{ connected, endaomentUserId, isLoading, error, refetch }}>
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
