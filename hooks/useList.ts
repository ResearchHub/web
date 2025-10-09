'use client';

import toast from 'react-hot-toast';
import { AsyncState } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import {
  CreateListParams,
  DeleteListParams,
  GetListParams,
  List,
  ListService,
  UpdateListParams,
} from '@/services/list.service';

// ==================== GET LISTS ====================

type UseGetListsState = AsyncState & { lists: List[] };

export function useGetLists(): UseGetListsState & { refresh: () => Promise<void> } {
  const [lists, setLists] = useState<UseGetListsState['lists']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UseGetListsState['error']>(null);

  const getLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLists(await ListService.getLists());
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to get lists'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getLists();
  }, [getLists]);

  return {
    lists,
    isLoading,
    error,
    refresh: getLists,
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

type CreateListFn = (params: CreateListParams) => Promise<List>;

export function useCreateList(): AsyncState & { createList: CreateListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const createList: CreateListFn = useCallback(async (params) => {
    const toastId = toast.loading('Creating list...');

    try {
      setIsLoading(true);
      setError(null);

      const response = await ListService.createList(params);

      toast.success(`${params.name} created!`, { id: toastId });

      return response;
    } catch (e) {
      const msg = 'Failed';

      setError(e instanceof Error ? e : new Error(msg));

      toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, createList };
}

// =================== DELETE LIST ===================

type DeleteListFn = (params: DeleteListParams) => Promise<void>;

export function useDeleteList(): AsyncState & { deleteList: DeleteListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const deleteList: DeleteListFn = useCallback(async (params) => {
    const toastId = toast.loading('Deleting list...');

    try {
      setIsLoading(true);
      setError(null);

      await ListService.deleteList(params);

      toast.success('Deleted!', { id: toastId });
    } catch (e) {
      const msg = 'Failed';

      setError(e instanceof Error ? e : new Error(msg));

      toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, deleteList };
}

// =================== UPDATE LIST ===================

type UpdateListFn = (params: UpdateListParams) => Promise<List>;

export function useUpdateList(): AsyncState & { updateList: UpdateListFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const updateList: UpdateListFn = useCallback(async (params) => {
    const toastId = toast.loading('Updating list...');

    try {
      setIsLoading(true);
      setError(null);

      const response = ListService.updateList(params);

      toast.success('Updated!', { id: toastId });

      return response;
    } catch (e) {
      const msg = 'Failed';

      setError(e instanceof Error ? e : new Error(msg));

      toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, updateList };
}
