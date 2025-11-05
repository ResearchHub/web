import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserLists } from './useUserLists';
import { ListService } from '@/services/list.service';
import { UserListDetail } from '@/types/user-list';

export function useIsInList(unifiedDocumentId: number | string | undefined | null): {
  isInList: boolean;
  isLoading: boolean;
  refetch: () => void;
  listDetails: UserListDetail[];
} {
  const { lists } = useUserLists();
  const [listDetails, setListDetails] = useState<UserListDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  useEffect(() => {
    if (!unifiedDocumentId || lists.length === 0) {
      setIsLoading(false);
      setListDetails([]);
      return;
    }
    setIsLoading(true);
    Promise.all(lists.map((list) => ListService.getListById(list.id)))
      .then(setListDetails)
      .catch((error) => {
        console.error('Failed to fetch list details:', error);
        setListDetails([]);
      })
      .finally(() => setIsLoading(false));
  }, [lists, unifiedDocumentId, refreshKey]);

  const isInList = useMemo(() => {
    if (!unifiedDocumentId || listDetails.length === 0) return false;
    const docId =
      typeof unifiedDocumentId === 'string' ? parseInt(unifiedDocumentId) : unifiedDocumentId;
    return listDetails.some((list) => list.items?.some((item) => item.unified_document === docId));
  }, [listDetails, unifiedDocumentId]);

  return { isInList, isLoading, refetch, listDetails };
}
