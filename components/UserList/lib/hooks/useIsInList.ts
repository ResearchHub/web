import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { ID } from '@/types/root';

export function useIsInList(unifiedDocumentId: ID) {
  const { overviewLists, isLoadingOverview } = useUserListsContext();

  if (!unifiedDocumentId) {
    return {
      isInList: false,
      isLoading: isLoadingOverview,
      overviewLists,
      listIdsContainingDocument: [],
    };
  }

  const listIdsContainingDocument = overviewLists
    .filter((list) =>
      list.unifiedDocuments?.some((doc) => doc.unifiedDocumentId == unifiedDocumentId)
    )
    .map((list) => list.listId);

  return {
    isInList: listIdsContainingDocument.length > 0,
    isLoading: isLoadingOverview,
    overviewLists,
    listIdsContainingDocument,
  };
}
