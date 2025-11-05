import { useState, useEffect, useCallback, useRef } from 'react';
import { ListService, UserListsResponse } from '@/services/list.service';
import {
  UserList,
  UserListDetail,
  UserListItem,
  CreateListRequest,
  UpdateListRequest,
  AddItemRequest,
  ListStats,
} from '@/types/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';

// Global ref to track if lists are being fetched to prevent duplicate calls
const globalFetchingRef = { current: false };

export function useUserLists() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [stats, setStats] = useState<ListStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const hasInitialized = useRef(false);

  const fetchLists = useCallback(async (pageNum: number = 1, reset: boolean = true) => {
    // Prevent duplicate concurrent fetches
    if (globalFetchingRef.current && pageNum === 1 && reset) {
      return;
    }

    globalFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ListService.getUserLists({ page: pageNum, pageSize: PAGE_SIZE });
      if (reset) {
        setLists(data.lists);
      } else {
        setLists((prev) => [...prev, ...data.lists]);
      }
      if (data.stats && (reset || pageNum === 1)) setStats(data.stats);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
      console.error('Failed to fetch lists:', err);
    } finally {
      setIsLoading(false);
      if (pageNum === 1 && reset) {
        globalFetchingRef.current = false;
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    // Don't set isLoading to true - we want to keep showing existing lists
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await ListService.getUserLists({ page: nextPage, pageSize: PAGE_SIZE });
      setLists((prev) => [...prev, ...data.lists]);
      if (data.stats && nextPage === 1) setStats(data.stats);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
      console.error('Failed to fetch lists:', err);
    }
    // Don't set isLoading to false - it wasn't set to true
  }, [hasMore, isLoading, page]);

  useEffect(() => {
    // Only fetch once on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchLists(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  const resetAndFetch = useCallback(() => {
    fetchLists(1, true);
  }, [fetchLists]);

  return {
    lists,
    stats,
    isLoading,
    error,
    hasMore,
    loadMore,
    fetchLists: resetAndFetch,
    createList,
    updateList,
    deleteList,
  };
}

export function useUserList(listId: number | null) {
  const [list, setList] = useState<UserListDetail | null>(null);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const lastListIdRef = useRef<number | null>(null);

  const fetchList = useCallback(
    async (pageNum: number = 1, reset: boolean = true) => {
      if (!listId) {
        setList(null);
        setItems([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await ListService.getListById(listId, { page: pageNum, pageSize: PAGE_SIZE });

        // Update list metadata (only on first page or reset)
        if (reset || pageNum === 1) {
          setList(data);
          setItems(data.items || []);
        } else {
          // Append items for pagination
          setItems((prev) => [...prev, ...(data.items || [])]);
          // Update list metadata but keep accumulated items
          setList((prev) =>
            prev ? { ...prev, ...data, items: [...prev.items, ...(data.items || [])] } : data
          );
        }

        // Determine hasMore: if we got fewer items than pageSize, or check if API provides next
        const receivedItems = data.items || [];
        setHasMore(receivedItems.length === PAGE_SIZE);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load list');
        console.error('Failed to fetch list:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [listId]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !listId) return;
    // Don't set isLoading to true - we want to keep showing existing items
    setError(null);
    try {
      const nextPage = page + 1;
      const data = await ListService.getListById(listId, { page: nextPage, pageSize: PAGE_SIZE });

      // Append items for pagination
      setItems((prev) => [...prev, ...(data.items || [])]);
      // Update list metadata but keep accumulated items
      setList((prev) =>
        prev ? { ...prev, ...data, items: [...prev.items, ...(data.items || [])] } : data
      );

      // Determine hasMore: if we got fewer items than pageSize
      const receivedItems = data.items || [];
      setHasMore(receivedItems.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load list');
      console.error('Failed to fetch list:', err);
    }
    // Don't set isLoading to false - it wasn't set to true
  }, [hasMore, isLoading, page, listId]);

  useEffect(() => {
    // Only fetch if listId changed or is new
    if (listId && listId !== lastListIdRef.current) {
      lastListIdRef.current = listId;
      // Reset state for new list
      setItems([]);
      setList(null);
      setIsLoading(true);
      setError(null);

      // Fetch directly to avoid dependency on fetchList
      ListService.getListById(listId, { page: 1, pageSize: PAGE_SIZE })
        .then((data) => {
          setList(data);
          setItems(data.items || []);
          const receivedItems = data.items || [];
          setHasMore(receivedItems.length === PAGE_SIZE);
          setPage(1);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load list');
          console.error('Failed to fetch list:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!listId) {
      // Reset if listId is null
      lastListIdRef.current = null;
      setItems([]);
      setList(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]); // Only depend on listId

  const addItem = useCallback(
    async (data: AddItemRequest) => {
      if (!listId) return;
      try {
        const newItem = await ListService.addItemToList(listId, data.unified_document);
        setItems((prev) => [...prev, newItem]);
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
        setItems((prev) => prev.filter((item) => item.id !== itemId));
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
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    fetchList: () => fetchList(1, true),
    addItem,
    removeItem,
  };
}
