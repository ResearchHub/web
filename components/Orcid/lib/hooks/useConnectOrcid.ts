import { useState, useCallback } from 'react';
import { connectOrcidAccount } from '@/components/Orcid/lib/services/orcid.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import toast from 'react-hot-toast';

export function useConnectOrcid() {
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await connectOrcidAccount();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to connect ORCID.'));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return {
    connect,
    isConnecting,
  };
}
