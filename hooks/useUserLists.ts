import { useState, useEffect, useCallback } from 'react';
import { ListService } from '@/services/list.service';
import { UserList, CreateListRequest, UpdateListRequest } from '@/types/user-list';
import { toast } from 'react-hot-toast';
import { ApiError } from '@/services/types';
import { useUserListsContext } from '@/contexts/UserListsContext';

const getError = (err: unknown) => (err instanceof ApiError ? err.message : 'Operation failed');

export function useUserLists() {
  const { refetchOverview } = useUserListsContext();
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
      const { results, next, count } = await ListService.getUserListsApi({ page });
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

  const withAction = useCallback(
    async (action: () => Promise<unknown>, msg: string) => {
      try {
        await action();
        toast.success(msg);
        await Promise.all([fetchLists(), refetchOverview()]);
      } catch (err) {
        toast.error(getError(err));
        throw err;
      }
    },
    [fetchLists, refetchOverview]
  );

  return {
    ...state,
    loadMore: () => state.hasMore && !state.isLoadingMore && fetchLists(state.page + 1, true),
    createList: (data: CreateListRequest) =>
      withAction(() => ListService.createListApi(data), 'List created'),
    updateList: (id: number, data: UpdateListRequest) =>
      withAction(() => ListService.updateListApi(id, data), 'List updated'),
    deleteList: (id: number) => withAction(() => ListService.deleteList(id), 'List deleted'),
  };
}
