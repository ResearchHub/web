import { useState, useCallback } from 'react';
import { syncOrcidAuthorship } from '@/components/Orcid/lib/services/orcid.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import toast from 'react-hot-toast';

interface UseSyncOrcidOptions {
  readonly onSuccess?: () => void;
}

export function useSyncOrcid(options?: UseSyncOrcidOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { onSuccess } = options || {};

  const sync = useCallback(async () => {
    try {
      setIsSyncing(true);
      await syncOrcidAuthorship();
      toast.success('Authorship synced from ORCID.');
      onSuccess?.();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to sync authorship.'));
    } finally {
      setIsSyncing(false);
    }
  }, [onSuccess]);

  return {
    sync,
    isSyncing,
  };
}
