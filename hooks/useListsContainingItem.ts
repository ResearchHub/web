import { useMemo } from 'react';
import { SimplifiedUserList, SimplifiedListItem } from '@/types/user-list';

/**
 * Hook to get which lists contain a specific item
 * Returns a Set of list IDs that contain the item
 *
 * This hook can reuse pre-fetched list details from useIsInList to avoid duplicate API calls.
 *
 * @param unifiedDocumentId - The unified document ID to check
 * @param listDetails - Optional pre-fetched simplified list details. If provided, skips fetching.
 * @param isLoading - Optional loading state from the list details fetch
 * @param refetch - Optional refetch function from the list details fetch
 */
export function useListsContainingItem(
  unifiedDocumentId: number | string | undefined | null,
  listDetails?: SimplifiedUserList[],
  isLoading?: boolean,
  refetch?: () => void
): {
  listIds: Set<number>;
  isLoading: boolean;
  refetch: () => void;
} {
  const listIds = useMemo(() => {
    if (!unifiedDocumentId || !listDetails || listDetails.length === 0) return new Set<number>();
    const docId =
      typeof unifiedDocumentId === 'string' ? parseInt(unifiedDocumentId) : unifiedDocumentId;
    const containingListIds = new Set<number>();
    listDetails.forEach((list) => {
      if (list.items?.some((item: SimplifiedListItem) => item.unified_document_id === docId)) {
        containingListIds.add(list.id);
      }
    });
    return containingListIds;
  }, [listDetails, unifiedDocumentId]);

  return {
    listIds,
    isLoading: isLoading ?? false,
    refetch: refetch ?? (() => {}),
  };
}
