'use client';

import toast from 'react-hot-toast';
import { AsyncState, PaginatedParams, PaginatedState } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import ListService, {
  CreateListParams,
  DeleteListParams,
  GetListParams,
  List,
  PaginatedListsResult,
  UpdateListParams,
} from '@/services/list.service';

// Ensures a stable default object reference
const DEFAULT_PAGINATED_PARAMS: PaginatedParams = {};

// ==================== GET LISTS ====================

type UseGetListsState = AsyncState & PaginatedListsResult;

export function useGetLists(
  params: PaginatedParams = DEFAULT_PAGINATED_PARAMS
): UseGetListsState & PaginatedState {
  const [lists, setLists] = useState<UseGetListsState['results']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UseGetListsState['error']>(null);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<UseGetListsState['next']>(null);
  const [previous, setPrevious] = useState<UseGetListsState['previous']>(null);

  const getLists = useCallback(
    async (resetLists = true) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await ListService.getLists(params);

        if (resetLists) {
          setLists(response.results);
        } else {
          setLists((prev) => [...prev, ...response.results]);
        }

        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to get lists'));
      } finally {
        setIsLoading(false);
      }
    },
    [params]
  );

  const loadMore = useCallback(async () => {
    if (!next || isLoading) return;

    await getLists(false);
  }, [next, isLoading, getLists]);

  useEffect(() => {
    void getLists();
  }, [getLists]);

  return {
    results: lists,
    count,
    next,
    previous,
    isLoading,
    error,
    refresh: () => getLists(true),
    loadMore,
    hasMore: !!next,
  };
}

// ==================== GET LIST ====================

type UseGetListState = AsyncState & { list: List | null };

export function useGetList(
  params: GetListParams
): UseGetListState & { refresh: () => Promise<void> } {
  const [list, setList] = useState<UseGetListState['list']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UseGetListState['error']>(null);

  const getList = useCallback(async () => {
    if (!params.id) return;

    try {
      setIsLoading(true);
      setError(null);
      setList(await ListService.getList(params));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to get list'));
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (params.id) void getList();
  }, [params, getList]);

  return {
    list,
    isLoading,
    error,
    refresh: getList,
  };
}

// =================== CREATE LIST ===================

type CreateListFn = (params: CreateListParams, useToast?: boolean) => Promise<List>;

export function useCreateList(): AsyncState & { createList: CreateListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const createList: CreateListFn = useCallback(async (params, useToast = true) => {
    const toastId = useToast ? toast.loading('Creating list...') : '';

    try {
      setIsLoading(true);
      setError(null);

      const response = await ListService.createList(params);

      if (useToast) toast.success(`${params.name} created!`, { id: toastId });

      return response;
    } catch (e) {
      const msg = 'Failed to create list';

      setError(e instanceof Error ? e : new Error(msg));

      if (useToast) toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, createList };
}

// =================== DELETE LIST ===================

type DeleteListFn = (params: DeleteListParams, useToast?: boolean) => Promise<void>;

export function useDeleteList(): AsyncState & { deleteList: DeleteListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const deleteList: DeleteListFn = useCallback(async (params, useToast = true) => {
    const toastId = useToast ? toast.loading('Deleting list...') : '';

    try {
      setIsLoading(true);
      setError(null);

      await ListService.deleteList(params);

      if (useToast) toast.success('List deleted', { id: toastId });
    } catch (e) {
      const msg = 'Failed to delete list';

      setError(e instanceof Error ? e : new Error(msg));

      if (useToast) toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, deleteList };
}

// =================== UPDATE LIST ===================

type UpdateListFn = (params: UpdateListParams, useToast?: boolean) => Promise<List>;

export function useUpdateList(): AsyncState & { updateList: UpdateListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const updateList: UpdateListFn = useCallback(async (params, useToast = true) => {
    const toastId = useToast ? toast.loading('Updating list...') : '';

    try {
      setIsLoading(true);
      setError(null);

      const response = ListService.updateList(params);

      if (useToast) toast.success('List updated!', { id: toastId });

      return response;
    } catch (e) {
      const msg = 'Failed to update list';

      setError(e instanceof Error ? e : new Error(msg));

      if (useToast) toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, updateList };
}
