'use client';

import toast from 'react-hot-toast';
import { AsyncState } from '@/lib/utils';
import { useCallback, useState } from 'react';
import ListItemService, {
  CreateListItemParams,
  DeleteListItemParams,
  ListItem,
} from '@/services/listItem.service';

// ================= CREATE LIST ITEM =================

type CreateListItemFn = (params: CreateListItemParams, useToast?: boolean) => Promise<ListItem>;

export function useCreateListItem(): AsyncState & { createListItem: CreateListItemFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const createListItem: CreateListItemFn = useCallback(async (params, useToast = true) => {
    const toastId = useToast ? toast.loading('Adding to list...') : '';

    try {
      setIsLoading(true);
      setError(null);

      const response = await ListItemService.createListItem(params);

      if (useToast) toast.success('Added to list!', { id: toastId });

      return response;
    } catch (e) {
      const msg = 'Failed to add to list';

      setError(e instanceof Error ? e : new Error(msg));

      if (useToast) toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, createListItem };
}

// ================= DELETE LIST ITEM =================

type DeleteListItemFn = (params: DeleteListItemParams, useToast?: boolean) => Promise<void>;

export function useDeleteListItem(): AsyncState & { deleteListItem: DeleteListItemFn } {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AsyncState['error']>(null);

  const deleteListItem: DeleteListItemFn = useCallback(async (params, useToast = true) => {
    const toastId = useToast ? toast.loading('Removing from list...') : '';

    try {
      setIsLoading(true);
      setError(null);

      await ListItemService.deleteListItem(params);

      if (useToast) toast.success('Removed from list', { id: toastId });
    } catch (e) {
      const msg = 'Failed to remove from list';

      setError(e instanceof Error ? e : new Error(msg));

      if (useToast) toast.error(msg, { id: toastId });

      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, deleteListItem };
}
