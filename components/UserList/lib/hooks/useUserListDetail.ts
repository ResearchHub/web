import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { UserListDetail } from '@/components/UserList/lib/user-list';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { updateListRemoveItem } from '@/components/UserList/lib/listUtils';

const PAGE_SIZE = 20;

interface UseUserListDetailOptions {
  readonly onItemMutated?: () => void;
}

export function useUserListDetail(listId: number | null, options?: UseUserListDetailOptions) {
  const [list, setList] = useState<UserListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchList = useCallback(async () => {
    if (!listId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [listData, itemsResponse] = await Promise.all([
        ListService.getListByIdApi(listId),
        ListService.getListItemsApi(listId, { page: 1, pageSize: PAGE_SIZE }),
      ]);

      setList({ ...listData, items: itemsResponse.results || [] });
      setHasMore(!!itemsResponse.next);
      setPage(1);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to load list'));
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore || !listId) return;

    setIsLoadingMore(true);

    try {
      const itemsResponse = await ListService.getListItemsApi(listId, {
        page: page + 1,
        pageSize: PAGE_SIZE,
      });

      setList((prev) =>
        prev ? { ...prev, items: [...prev.items, ...(itemsResponse.results || [])] } : null
      );
      setHasMore(!!itemsResponse.next);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to load more items'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, listId, page]);

  useEffect(() => {
    if (listId) {
      fetchList();
    } else {
      setList(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      setHasMore(false);
      setPage(1);
    }
  }, [listId, fetchList]);

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!listId) return;
      try {
        await ListService.removeItemFromListApi(listId, itemId);
        setList((prev) => updateListRemoveItem(prev, itemId));
        toast.success('Item removed');
        options?.onItemMutated?.();
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to remove item'));
      }
    },
    [listId, options]
  );

  const updateListDetails = useCallback((updatedList: Partial<UserListDetail>) => {
    setList((prev) => (prev ? { ...prev, ...updatedList } : null));
  }, []);

  return {
    list,
    items: list?.items || [],
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    removeItem,
    updateListDetails,
  };
}
