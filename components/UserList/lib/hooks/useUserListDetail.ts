import { useState, useEffect } from 'react';
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
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const fetchList = async () => {
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
      setCurrentPageNumber(1);
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Failed to load list'));
      console.error('Failed to load list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading || isLoadingMore || !listId) return;

    setIsLoadingMore(true);

    try {
      const itemsResponse = await ListService.getListItemsApi(listId, {
        page: currentPageNumber + 1,
        pageSize: PAGE_SIZE,
      });

      setList((previousList) =>
        previousList
          ? { ...previousList, items: [...previousList.items, ...(itemsResponse.results || [])] }
          : null
      );
      setHasMore(!!itemsResponse.next);
      setCurrentPageNumber((previousPageNumber) => previousPageNumber + 1);
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Failed to load more items'));
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (listId) {
      fetchList();
    } else {
      setList(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      setHasMore(false);
      setCurrentPageNumber(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const removeItem = async (itemId: number) => {
    if (!listId) return;
    try {
      await ListService.removeItemFromListApi(listId, itemId);
      setList((previousList) => updateListRemoveItem(previousList, itemId));
      toast.success('Item removed');
      options?.onItemMutated?.();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove item'));
      console.error('Failed to remove item:', error);
    }
  };

  const updateListDetails = (updatedListData: Partial<UserListDetail>) => {
    setList((previousList) => (previousList ? { ...previousList, ...updatedListData } : null));
  };

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
