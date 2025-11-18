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
    error: string | null;
  }>({
    lists: [],
    isLoading: true,
    error: null,
  });

  const fetchLists = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { results } = await ListService.getUserLists();
      setState({ lists: results || [], isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false, error: getError(err) }));
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
    createList: (data: CreateListRequest) =>
      performAction(() => ListService.createList(data), 'List created'),
    updateList: (id: number, data: UpdateListRequest) =>
      performAction(() => ListService.updateList(id, data), 'List updated'),
    deleteList: (id: number) => performAction(() => ListService.deleteList(id), 'List deleted'),
  };
}
