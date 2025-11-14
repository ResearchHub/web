import { useState, useEffect, useCallback, useRef } from 'react';
import { ListService } from '@/services/list.service';
import {
  UserList,
  UserListDetail,
  UserListItem,
  CreateListRequest,
  UpdateListRequest,
  AddItemRequest,
} from '@/types/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/utils/apiError';
import { updateListRemoveItem } from '@/utils/listUtils';
import { useUser } from '@/contexts/UserContext';

const PAGE_SIZE = 20;

export function useUserLists() {
  const { user } = useUser();
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const hasInitialized = useRef(false);
  const lastUserIdRef = useRef<number | null>(null);

  const fetchLists = useCallback(async (pageNum = 1, reset = true) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const data = await ListService.getUserLists({ page: pageNum, pageSize: PAGE_SIZE });
      setLists((prev) => (reset ? data.lists : [...prev, ...data.lists]));
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Failed to load lists'));
      console.error(err);
    } finally {
      if (reset) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    await fetchLists(page + 1, false);
  }, [hasMore, isLoading, isLoadingMore, page, fetchLists]);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = lastUserIdRef.current;
    const shouldFetch =
      (currentUserId !== null && previousUserId !== currentUserId) ||
      (!hasInitialized.current && currentUserId !== null);

    if (shouldFetch) {
      hasInitialized.current = true;
      lastUserIdRef.current = currentUserId;
      fetchLists(1, true);
    } else if (previousUserId !== null && currentUserId === null) {
      setLists([]);
      setError(null);
      setIsLoading(false);
      hasInitialized.current = false;
      lastUserIdRef.current = null;
    } else if (!hasInitialized.current && currentUserId === null) {
      setIsLoading(false);
    }
  }, [user?.id, fetchLists]);

  const createList = useCallback(
    async (data: CreateListRequest) => {
      try {
        const newList = await ListService.createList(data);
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
        toast.success('List deleted successfully');
        await fetchLists();
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to delete list'));
        throw err;
      }
    },
    [fetchLists]
  );

  return {
    lists,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    fetchLists: () => fetchLists(1, true),
    createList,
    updateList,
    deleteList,
  };
}

export function useUserList(listId: number | null, options?: { onItemMutated?: () => void }) {
  const [list, setList] = useState<UserListDetail | null>(null);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const lastListIdRef = useRef<number | null>(null);
  const onItemMutated = options?.onItemMutated;

  const fetchList = useCallback(
    async (pageNum = 1, reset = true) => {
      if (!listId) {
        setList(null);
        setItems([]);
        setIsLoading(false);
        return;
      }

      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const [listData, itemsResponse] = await Promise.all([
          reset || pageNum === 1 ? ListService.getListById(listId) : Promise.resolve(null),
          ListService.getListItems(listId, { page: pageNum, pageSize: PAGE_SIZE }),
        ]);

        const newItems = itemsResponse.results || [];

        if (reset || pageNum === 1) {
          if (listData) {
            setList({ ...listData, items: newItems });
            setItems(newItems);
          }
        } else {
          setItems((prev) => [...prev, ...newItems]);
          setList((prev) =>
            prev ? { ...prev, items: [...(prev.items || []), ...newItems] } : null
          );
        }

        setHasMore(!!itemsResponse.next);
        setPage(pageNum);
      } catch (err) {
        setError(extractApiErrorMessage(err, 'Failed to load list'));
        console.error(err);
      } finally {
        if (reset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [listId]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore || !listId) return;
    await fetchList(page + 1, false);
  }, [hasMore, isLoading, isLoadingMore, page, listId, fetchList]);

  useEffect(() => {
    if (listId && listId !== lastListIdRef.current) {
      lastListIdRef.current = listId;
      fetchList(1, true);
    } else if (!listId) {
      lastListIdRef.current = null;
      setItems([]);
      setList(null);
      setIsLoading(false);
    }
  }, [listId, fetchList]);

  const addItem = useCallback(
    async (data: AddItemRequest) => {
      if (!listId) return;
      try {
        await ListService.addItemToList(listId, data.unified_document);
        toast.success('Item added to list');
        await fetchList(1, true);
        onItemMutated?.();
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to add item'));
        throw err;
      }
    },
    [listId, onItemMutated, fetchList]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!listId) return;
      try {
        await ListService.removeItemFromList(itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        setList((prev) => updateListRemoveItem(prev, itemId));
        toast.success('Item removed from list');
        onItemMutated?.();
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to remove item'));
        throw err;
      }
    },
    [listId, onItemMutated]
  );

  const updateListDetails = useCallback(
    (updatedList: Partial<UserListDetail>) =>
      setList((prev) => (prev ? { ...prev, ...updatedList } : null)),
    []
  );

  return {
    list,
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    fetchList: () => fetchList(1, true),
    addItem,
    removeItem,
    updateListDetails,
  };
}
