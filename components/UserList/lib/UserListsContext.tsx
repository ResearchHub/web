'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ListService } from '@/components/UserList/lib/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListOverview,
} from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';

interface UserListsContextType {
  createList: (data: CreateListRequest, shouldRefreshLists?: boolean) => Promise<UserList>;
  updateList: (
    listId: number,
    data: UpdateListRequest,
    shouldRefreshLists?: boolean
  ) => Promise<UserList>;
  deleteList: (listId: number, shouldRefreshLists?: boolean) => Promise<void>;
  overviewLists: UserListOverview[];
  isLoadingOverview: boolean;
  refetchOverview: () => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const [overviewLists, setOverviewLists] = useState<UserListOverview[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const refetchOverview = async () => {
    if (!user) return;
    setIsLoadingOverview(true);
    try {
      const response = await ListService.getOverviewApi();
      setOverviewLists(response.lists || []);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      setOverviewLists([]);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (user) {
      refetchOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const executeListActionWithToast = async <T,>(
    action: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    shouldRefreshLists = true
  ): Promise<T> => {
    try {
      const result = await action();
      toast.success(successMessage);
      if (shouldRefreshLists) {
        await refetchOverview();
      }
      return result;
    } catch (error) {
      toast.error(extractApiErrorMessage(error, errorMessage));
      console.error(errorMessage, error);
      throw error;
    }
  };

  const createList = (data: CreateListRequest, shouldRefreshLists = true) =>
    executeListActionWithToast(
      () => ListService.createListApi(data),
      'List created',
      'Failed to create list',
      shouldRefreshLists
    );

  const updateList = (listId: number, data: UpdateListRequest, shouldRefreshLists = true) =>
    executeListActionWithToast(
      () => ListService.updateListApi(listId, data),
      'List updated',
      'Failed to update list',
      shouldRefreshLists
    );

  const deleteList = async (listId: number, shouldRefreshLists = true): Promise<void> => {
    await executeListActionWithToast(
      () => ListService.deleteListApi(listId),
      'List deleted',
      'Failed to delete list',
      shouldRefreshLists
    );
  };

  const value = {
    createList,
    updateList,
    deleteList,
    overviewLists,
    isLoadingOverview,
    refetchOverview,
  };

  return <UserListsContext.Provider value={value}>{children}</UserListsContext.Provider>;
}

export function useUserListsContext() {
  const context = useContext(UserListsContext);
  if (context === undefined) {
    throw new Error('useUserListsContext must be used within a UserListsProvider');
  }
  return context;
}
