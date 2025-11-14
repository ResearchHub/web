import { useState, useEffect, useCallback, useMemo } from 'react';
import { ListService } from '@/services/list.service';
import { SimplifiedUserList } from '@/types/user-list';

export function useIsInList(unifiedDocumentId: number | string | null | undefined) {
  const [lists, setLists] = useState<SimplifiedUserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const docId = useMemo(() => {
    if (!unifiedDocumentId) return null;
    return typeof unifiedDocumentId === 'string' ? parseInt(unifiedDocumentId) : unifiedDocumentId;
  }, [unifiedDocumentId]);

  const refetch = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  useEffect(() => {
    if (!docId) {
      setIsLoading(false);
      setLists([]);
      return;
    }

    setIsLoading(true);
    ListService.getOverview()
      .then((response) => setLists(response.lists || []))
      .catch((error) => {
        console.error('Failed to fetch overview data:', error);
        setLists([]);
      })
      .finally(() => setIsLoading(false));
  }, [docId, refreshKey]);

  const listIdsContainingItem = useMemo(() => {
    if (!docId || !lists.length) return new Set<number>();
    return new Set(
      lists
        .filter((list) => list.items?.some((item) => item.unified_document_id === docId))
        .map((list) => list.id)
    );
  }, [lists, docId]);

  return {
    isInList: listIdsContainingItem.size > 0,
    isLoading,
    refetch,
    listDetails: lists,
    listIds: listIdsContainingItem,
  };
}
