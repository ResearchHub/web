import { useMemo } from 'react';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { ID } from '@/types/root';

export function useIsInList(unifiedDocumentId: ID) {
  const { overviewLists, isLoadingOverview } = useUserListsContext();

  const documentIdAsNumber = useMemo(() => {
    if (!unifiedDocumentId) return null;
    return typeof unifiedDocumentId === 'string' ? Number(unifiedDocumentId) : unifiedDocumentId;
  }, [unifiedDocumentId]);

  const listIdsContainingDocument = useMemo(() => {
    if (!documentIdAsNumber) return [];
    return overviewLists
      .filter((list) =>
        list.unifiedDocuments?.some((doc) => doc.unifiedDocumentId === documentIdAsNumber)
      )
      .map((list) => list.listId);
  }, [overviewLists, documentIdAsNumber]);

  return {
    isInList: listIdsContainingDocument.length > 0,
    isLoading: isLoadingOverview,
    overviewLists,
    listIdsContainingDocument,
  };
}
