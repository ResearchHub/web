import { useState, useCallback } from 'react';
import { syncOrcidAuthorship } from '@/components/Orcid/lib/services/orcid.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import toast from 'react-hot-toast';

export function useSyncOrcid() {
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncOrcidAuthorship();
      toast.success('Authorship synced from ORCID.');
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to sync authorship.'));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    sync,
    isSyncing,
  };
}
