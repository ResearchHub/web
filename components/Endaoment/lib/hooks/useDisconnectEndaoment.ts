import { useState, useCallback } from 'react';
import { disconnectEndaomentAccount } from '@/services/endaoment.service';
import { useEndaoment } from '@/contexts/EndaomentContext';
import toast from 'react-hot-toast';

/**
 * Hook to disconnect the user's Endaoment account.
 * After disconnecting, it refetches the Endaoment status to update the UI.
 */
export function useDisconnectEndaoment() {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { refetch } = useEndaoment();

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await disconnectEndaomentAccount();
      await refetch();
      toast.success('Endaoment account disconnected');
    } catch {
      toast.error('Unable to disconnect Endaoment account.');
    } finally {
      setIsDisconnecting(false);
    }
  }, [refetch]);

  return { disconnect, isDisconnecting };
}
