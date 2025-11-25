import { useMemo } from 'react';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { ID } from '@/types/root';

export function useIsInList(unifiedDocumentId: ID) {
  const { overviewLists, isLoadingOverview, refetchOverview } = useUserListsContext();

  const docId = useMemo(() => {
    if (!unifiedDocumentId) return null;
    return typeof unifiedDocumentId === 'string'
      ? Number.parseInt(unifiedDocumentId, 10)
      : unifiedDocumentId;
  }, [unifiedDocumentId]);

  const listIds = useMemo(() => {
    if (!docId) return [];

    return overviewLists
      .filter((list) => list.unifiedDocuments?.some((item) => item.unifiedDocumentId === docId))
      .map((list) => list.listId);
  }, [overviewLists, docId]);

  return {
    isInList: listIds.length > 0,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
    listDetails: overviewLists,
    listIds,
  };
}
