import { useState, useEffect, useCallback } from 'react';
import { ListService } from '@/services/list.service';
import { UserList, CreateListRequest, UpdateListRequest } from '@/types/user-list';
import { toast } from 'react-hot-toast';
import { ApiError } from '@/services/types';

const getError = (err: unknown) => (err instanceof ApiError ? err.message : 'Operation failed');

export function useUserLists() {
  const [state, setState] = useState<{
    lists: UserList[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    totalCount: number;
  }>({
    lists: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    page: 1,
    hasMore: false,
    totalCount: 0,
  });

  const fetchLists = useCallback(async (page = 1, isLoadMore = false) => {
    setState((prev) => ({
      ...prev,
      isLoading: !isLoadMore,
      isLoadingMore: isLoadMore,
      error: null,
    }));

    try {
      const { results, next, count } = await ListService.getUserLists(page);
      setState((prev) => ({
        ...prev,
        lists: isLoadMore ? [...prev.lists, ...results] : results,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        page,
        hasMore: !!next,
        totalCount: count,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: getError(err),
      }));
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const performAction = useCallback(
    async (action: () => Promise<unknown>, successMsg: string) => {
      try {
        await action();
        toast.success(successMsg);
        fetchLists();
      } catch (err) {
        toast.error(getError(err));
        throw err;
      }
    },
    [fetchLists]
  );

  return {
    ...state,
    loadMore: () => state.hasMore && !state.isLoadingMore && fetchLists(state.page + 1, true),
    createList: (data: CreateListRequest) =>
      performAction(() => ListService.createList(data), 'List created'),
    updateList: (id: number, data: UpdateListRequest) =>
      performAction(() => ListService.updateList(id, data), 'List updated'),
    deleteList: (id: number) => performAction(() => ListService.deleteList(id), 'List deleted'),
  };
}
