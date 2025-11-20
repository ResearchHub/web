import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/services/list.service';
import { UserList, UserListDetail } from '@/types/user-list';
import { extractApiErrorMessage } from '@/utils/apiError';
import { updateListRemoveItem } from '@/utils/listUtils';

const PAGE_SIZE = 20;

interface UseUserListDetailOptions {
  onItemMutated?: () => void;
}

export function useUserListDetail(listId: number | null, options?: UseUserListDetailOptions) {
  const [state, setState] = useState({
    list: null as UserListDetail | null,
    isLoading: true,
    isLoadingMore: false,
    error: null as string | null,
    hasMore: false,
    page: 1,
  });
  const lastListIdRef = useRef<number | null>(null);

  const fetchList = useCallback(
    async (pageNum = 1, reset = true) => {
      if (!listId) return;

      setState((prev) => ({
        ...prev,
        isLoading: reset,
        isLoadingMore: !reset,
        error: null,
      }));

      try {
        let listData: UserList | null = null;

        if (reset) {
          listData = await ListService.getListByIdApi(listId);
        }

        const itemsResponse = await ListService.getListItemsApi(listId, {
          page: pageNum,
          pageSize: PAGE_SIZE,
        });

        const newItems = itemsResponse.results || [];

        setState((prev) => {
          let updatedList: UserListDetail | null = null;

          if (reset && listData) {
            updatedList = { ...listData, items: newItems };
          } else if (prev.list) {
            updatedList = { ...prev.list, items: [...prev.list.items, ...newItems] };
          }

          return {
            ...prev,
            list: updatedList,
            isLoading: false,
            isLoadingMore: false,
            hasMore: !!itemsResponse.next,
            page: pageNum,
          };
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          error: extractApiErrorMessage(err, 'Failed to load list'),
        }));
      }
    },
    [listId]
  );

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading || state.isLoadingMore || !listId) return;
    await fetchList(state.page + 1, false);
  }, [state.hasMore, state.isLoading, state.isLoadingMore, state.page, listId, fetchList]);

  useEffect(() => {
    if (listId !== lastListIdRef.current) {
      lastListIdRef.current = listId;
      if (listId) fetchList(1, true);
      else {
        setState({
          list: null,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore: false,
          page: 1,
        });
      }
    }
  }, [listId, fetchList]);

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!listId) return;
      try {
        await ListService.removeItemFromList(itemId);
        setState((prev) => ({
          ...prev,
          list: updateListRemoveItem(prev.list, itemId),
        }));
        toast.success('Item removed');
        options?.onItemMutated?.();
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to remove item'));
      }
    },
    [listId, options]
  );

  const updateListDetails = useCallback((updatedList: Partial<UserListDetail>) => {
    setState((prev) => ({
      ...prev,
      list: prev.list ? { ...prev.list, ...updatedList } : null,
    }));
  }, []);

  return {
    ...state,
    items: state.list?.items || [],
    loadMore,
    removeItem,
    updateListDetails,
  };
}
