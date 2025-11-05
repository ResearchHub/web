import { useState, useEffect, useCallback, useMemo } from 'react';
import { ListService } from '@/services/list.service';
import { SimplifiedUserList, SimplifiedListItem } from '@/types/user-list';

// Cache for user check data to avoid fetching multiple times
let userCheckCache: { data: SimplifiedUserList[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// Global ref to track if we're currently fetching to prevent duplicate requests
let isFetching = false;
const pendingCallbacks: Array<(data: SimplifiedUserList[]) => void> = [];

async function fetchUserCheckData(): Promise<SimplifiedUserList[]> {
  const now = Date.now();

  // Check cache first
  if (userCheckCache && now - userCheckCache.timestamp < CACHE_DURATION) {
    return userCheckCache.data;
  }

  // If already fetching, wait for it
  if (isFetching) {
    return new Promise((resolve) => {
      pendingCallbacks.push(resolve);
    });
  }

  // Start fetching
  isFetching = true;
  try {
    const response = await ListService.getUserCheck();
    const data = response.lists || [];

    // Update cache
    userCheckCache = { data, timestamp: now };

    // Resolve all pending callbacks
    pendingCallbacks.forEach((callback) => callback(data));
    pendingCallbacks.length = 0;

    return data;
  } catch (error) {
    console.error('Failed to fetch user check data:', error);
    // Resolve pending callbacks with empty array on error
    pendingCallbacks.forEach((callback) => callback([]));
    pendingCallbacks.length = 0;
    throw error;
  } finally {
    isFetching = false;
  }
}

export function useIsInList(unifiedDocumentId: number | string | undefined | null): {
  isInList: boolean;
  isLoading: boolean;
  refetch: () => void;
  listDetails: SimplifiedUserList[]; // Return simplified structure for compatibility
} {
  const [listDetails, setListDetails] = useState<SimplifiedUserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    userCheckCache = null;
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!unifiedDocumentId) {
      setIsLoading(false);
      setListDetails([]);
      return;
    }

    setIsLoading(true);
    fetchUserCheckData()
      .then((data) => {
        setListDetails(data);
      })
      .catch(() => {
        setListDetails([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [unifiedDocumentId, refreshKey]);

  const isInList = useMemo(() => {
    if (!unifiedDocumentId || listDetails.length === 0) return false;
    const docId =
      typeof unifiedDocumentId === 'string' ? parseInt(unifiedDocumentId) : unifiedDocumentId;
    return listDetails.some((list) =>
      list.items?.some((item: SimplifiedListItem) => item.unified_document_id === docId)
    );
  }, [listDetails, unifiedDocumentId]);

  return { isInList, isLoading, refetch, listDetails };
}
