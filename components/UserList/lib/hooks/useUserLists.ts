import { useState, useEffect, useCallback } from 'react';
import { ListService } from '@/components/UserList/lib/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
} from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUserListsContext } from '@/components/UserList/lib/UserListsContext';
import { useUser } from '@/contexts/UserContext';

export function useUserLists() {
  const { user } = useUser();
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

  const fetchLists = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (!user) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        }));
        return;
      }

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
          error: extractApiErrorMessage(err, 'Failed to load lists'),
        }));
      }
    },
    [user]
  );

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const withAction = useCallback(
    async (action: () => Promise<unknown>, successMsg: string, errorMsg: string) => {
      try {
        await action();
        toast.success(successMsg);
        await Promise.all([fetchLists(), refetchOverview()]);
      } catch (err) {
        toast.error(extractApiErrorMessage(err, errorMsg));
        throw err;
      }
    },
    [fetchLists]
  );

  return {
    ...state,
    loadMore: () => state.hasMore && !state.isLoadingMore && fetchLists(state.page + 1, true),
    createList: (data: CreateListRequest) =>
      withAction(() => ListService.createListApi(data), 'List created', 'Failed to create list'),
    updateList: (id: number, data: UpdateListRequest) =>
      withAction(
        () => ListService.updateListApi(id, data),
        'List updated',
        'Failed to update list'
      ),
    deleteList: (id: number) =>
      withAction(() => ListService.deleteListApi(id), 'List deleted', 'Failed to delete list'),
  };
}
