import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { ID } from '@/types/root';

export function useIsInList(unifiedDocumentId: ID) {
  const { overviewLists, isLoadingOverview, refetchOverview } = useUserListsContext();

  const documentIdAsNumber = unifiedDocumentId
    ? typeof unifiedDocumentId === 'string'
      ? Number(unifiedDocumentId)
      : unifiedDocumentId
    : null;

  const listIdsContainingDocument = documentIdAsNumber
    ? overviewLists
        .filter((list) =>
          list.unifiedDocuments?.some((doc) => doc.unifiedDocumentId === documentIdAsNumber)
        )
        .map((list) => list.listId)
    : [];

  return {
    isInList: listIdsContainingDocument.length > 0,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
    listDetails: overviewLists,
    listIdsContainingDocument,
  };
}
