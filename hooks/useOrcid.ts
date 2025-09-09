import { useState, useEffect, useCallback } from 'react';
import { getOrcidStatus, triggerOrcidSync, redirectToOrcidLogin } from '@/services/orcid.service';
import { toast } from 'react-hot-toast';

interface OrcidStatus {
  isConnected: boolean;
  orcidId: string | null;
  needsReauth: boolean;
  error: string | null;
}

interface UseOrcidReturn {
  status: OrcidStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshStatus: () => Promise<void>;
  sync: () => Promise<void>;
  connect: (returnTo?: string) => Promise<void>;
}

// Cache for ORCID status to avoid redundant API calls
let cachedStatus: OrcidStatus | null = null;
let cacheTimestamp: number = 0;
let ongoingRequest: Promise<OrcidStatus> | null = null;
const CACHE_DURATION = 30000; // 30 seconds cache

export function useOrcid(): UseOrcidReturn {
  const [status, setStatus] = useState<OrcidStatus>({
    isConnected: false,
    orcidId: null,
    needsReauth: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    const now = Date.now();

    // Use cached data if it's still fresh
    if (cachedStatus && now - cacheTimestamp < CACHE_DURATION) {
      setStatus(cachedStatus);
      setIsLoading(false);
      return;
    }

    // If there's already an ongoing request, wait for it instead of making a new one
    if (ongoingRequest) {
      try {
        setIsRefreshing(true);
        const newStatus = await ongoingRequest;
        setStatus(newStatus);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      return;
    }

    try {
      setIsRefreshing(true);

      // Create and store the promise to prevent duplicate requests
      ongoingRequest = getOrcidStatus();
      const newStatus = await ongoingRequest;

      // Update cache
      cachedStatus = newStatus;
      cacheTimestamp = now;

      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to refresh ORCID status:', error);
      const errorStatus = {
        isConnected: false,
        orcidId: null,
        needsReauth: false,
        error: 'Failed to check ORCID status',
      };
      setStatus(errorStatus);
      cachedStatus = errorStatus;
      cacheTimestamp = now;
    } finally {
      // Clear the ongoing request
      ongoingRequest = null;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const sync = useCallback(async () => {
    try {
      if (!status.isConnected) {
        toast.error('Please connect your ORCID account first');
        return;
      }

      await triggerOrcidSync();
      toast.success("Sync started! We'll refresh your authorship shortly.");
    } catch (error) {
      console.error('Failed to sync ORCID:', error);
      toast.error('Could not start ORCID sync. Please try again.');
    }
  }, [status.isConnected]);

  const connect = useCallback(async (returnTo?: string) => {
    try {
      await redirectToOrcidLogin(returnTo || window.location.href);
    } catch (error) {
      console.error('Failed to connect ORCID:', error);
      toast.error('Could not start ORCID connection. Please try again.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    isLoading,
    isRefreshing,
    refreshStatus,
    sync,
    connect,
  };
}

// Utility function to invalidate cache (useful after successful sync/connect)
export function invalidateOrcidCache(): void {
  cachedStatus = null;
  cacheTimestamp = 0;
  ongoingRequest = null;
}
