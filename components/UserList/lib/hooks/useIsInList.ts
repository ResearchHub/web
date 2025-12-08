import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { idMatch } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';

export function useIsInList(unifiedDocumentId: ID) {
  const { overviewLists, isLoadingOverview } = useUserListsContext();

  if (!unifiedDocumentId) {
    return {
      isInList: false,
      isLoading: isLoadingOverview,
      overviewLists,
      listIdsContainingDocument: [] as ID[],
    };
  }

  const listIdsContainingDocument = overviewLists
    .filter((list) =>
      list.unifiedDocuments?.some((doc) => idMatch(doc.unifiedDocumentId, unifiedDocumentId))
    )
    .map((list) => list.id);

  return {
    isInList: listIdsContainingDocument.length > 0,
    isLoading: isLoadingOverview,
    overviewLists,
    listIdsContainingDocument,
  };
}
