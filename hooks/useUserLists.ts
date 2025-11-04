import { useState, useEffect, useCallback } from 'react';
import { ListService, UserListsResponse } from '@/services/list.service';
import {
  UserList,
  UserListDetail,
  CreateListRequest,
  UpdateListRequest,
  AddItemRequest,
  ListStats,
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
      setLists(data.lists);
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
        // Refresh lists to get updated counts
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

export function useUserList(listId: number | null) {
  const [list, setList] = useState<UserListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!listId) {
      setList(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setList(await ListService.getListById(listId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load list');
      console.error('Failed to fetch list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addItem = useCallback(
    async (data: AddItemRequest) => {
      if (!listId) return;
      try {
        const newItem = await ListService.addItemToList(listId, data.unified_document);
        setList((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            items: [...prev.items, newItem],
            item_count: (prev.item_count || prev.items?.length || 0) + 1,
          };
        });
        toast.success('Item added to list');
        return newItem;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
        toast.error(errorMessage);
        throw err;
      }
    },
    [listId]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!listId) return;
      try {
        await ListService.removeItemFromList(listId, itemId);
        setList((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
            item_count: Math.max(0, (prev.item_count || prev.items?.length || 0) - 1),
          };
        });
        toast.success('Item removed from list');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
        toast.error(errorMessage);
        throw err;
      }
    },
    [listId]
  );

  return {
    list,
    isLoading,
    error,
    fetchList,
    addItem,
    removeItem,
  };
}
