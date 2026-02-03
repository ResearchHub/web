import { useState, useEffect } from 'react';
import { getEndaomentStatus } from '@/services/endaoment.service';

interface EndaomentStatusState {
  connected: boolean;
  endaomentUserId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * This hook provides the connection status of the Endaoment account.
 * If the user is connected, it also provides the Endaoment user ID
 * (i.e., the external user ID, not the ResearchHub user ID).
 */
export function useEndaomentStatus() {
  const [state, setState] = useState<EndaomentStatusState>({
    connected: false,
    endaomentUserId: null,
    isLoading: true,
    error: null,
  });

  const refetch = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const status = await getEndaomentStatus();
      setState({
        connected: status.connected,
        endaomentUserId: status.endaomentUserId,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch Endaoment status',
      }));
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { ...state, refetch };
}
