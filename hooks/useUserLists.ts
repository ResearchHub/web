import { useState, useEffect, useCallback } from 'react';
import { ListService } from '@/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  ListStats,
  UserListsResponse,
} from '@/types/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';

export function useUserLists() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [stats, setStats] = useState<ListStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: UserListsResponse = await ListService.getUserLists();
      setLists(data.results || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
      console.error('Failed to fetch lists:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (data: CreateListRequest) => {
      try {
        const newList = await ListService.createList(data);
        setLists((prev) => [...prev, newList]);
        toast.success('List created successfully');
        await fetchLists();
        return newList;
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to create list'));
        throw err;
      }
    },
    [fetchLists]
  );

  const updateList = useCallback(
    async (listId: number, data: UpdateListRequest) => {
      try {
        const updatedList = await ListService.updateList(listId, data);
        setLists((prev) => prev.map((list) => (list.id === listId ? updatedList : list)));
        toast.success('List updated successfully');
        await fetchLists();
        return updatedList;
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to update list'));
        throw err;
      }
    },
    [fetchLists]
  );

  const deleteList = useCallback(
    async (listId: number) => {
      try {
        await ListService.deleteList(listId);
        setLists((prev) => prev.filter((list) => list.id !== listId));
        toast.success('List deleted successfully');
        await fetchLists();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete list';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchLists]
  );

  return {
    lists,
    stats,
    isLoading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
  };
}
