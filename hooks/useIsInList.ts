import { useMemo } from 'react';
import { useUserListsContext } from '@/components/List/lib/UserListsContext';

export function useIsInList(unifiedDocumentId: number | string | null | undefined) {
  const { overviewLists, isLoadingOverview, refetchOverview } = useUserListsContext();

  let docId: number | null = null;
  if (unifiedDocumentId) {
    if (typeof unifiedDocumentId === 'string') {
      docId = Number.parseInt(unifiedDocumentId);
    } else {
      docId = unifiedDocumentId;
    }
  }

  const listIds = useMemo(() => {
    if (!docId) return new Set<number>();
    return new Set(
      overviewLists
        .filter((list) =>
          list.unified_documents?.some((item) => item.unified_document_id === docId)
        )
        .map((list) => list.list_id)
    );
  }, [overviewLists, docId]);

  return {
    isInList: listIds.size > 0,
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
    listDetails: overviewLists,
    listIds,
  };
}
