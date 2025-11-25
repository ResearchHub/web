'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
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
  createList: (data: CreateListRequest, refreshLists?: boolean) => Promise<UserList>;
  updateList: (
    listId: number,
    data: UpdateListRequest,
    refreshLists?: boolean
  ) => Promise<UserList>;
  deleteList: (listId: number, refreshLists?: boolean) => Promise<void>;
  overviewLists: UserListOverview[];
  isLoadingOverview: boolean;
  refetchOverview: () => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const [overviewLists, setOverviewLists] = useState<UserListOverview[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const refetchOverview = useCallback(async () => {
    if (!user) return;
    setIsLoadingOverview(true);
    try {
      const response = await ListService.getOverview();
      setOverviewLists(response.lists || []);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
      setOverviewLists([]);
    } finally {
      setIsLoadingOverview(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refetchOverview();
    }
  }, [user, refetchOverview]);

  const withRefresh = useCallback(
    async <T,>(
      action: () => Promise<T>,
      successMsg: string,
      errorMsg: string,
      refreshLists = true
    ): Promise<T> => {
      try {
        const result = await action();
        toast.success(successMsg);
        if (refreshLists) {
          await refetchOverview();
        }
        return result;
      } catch (err) {
        toast.error(extractApiErrorMessage(err, errorMsg));
        throw err;
      }
    },
    [refetchOverview]
  );

  const createList = useCallback(
    (data: CreateListRequest, refreshLists = true) =>
      withRefresh(
        () => ListService.createListApi(data),
        'List created successfully',
        'Failed to create list',
        refreshLists
      ),
    [withRefresh]
  );

  const updateList = useCallback(
    (listId: number, data: UpdateListRequest, refreshLists = true) =>
      withRefresh(
        () => ListService.updateListApi(listId, data),
        'List updated successfully',
        'Failed to update list',
        refreshLists
      ),
    [withRefresh]
  );

  const deleteList = useCallback(
    (listId: number, refreshLists = true) =>
      withRefresh(
        () => ListService.deleteList(listId),
        'List deleted successfully',
        'Failed to delete list',
        refreshLists
      ) as Promise<void>,
    [withRefresh]
  );

  const value = useMemo(
    () => ({
      createList,
      updateList,
      deleteList,
      overviewLists,
      isLoadingOverview,
      refetchOverview,
    }),
    [createList, updateList, deleteList, overviewLists, isLoadingOverview, refetchOverview]
  );

  return <UserListsContext.Provider value={value}>{children}</UserListsContext.Provider>;
}

export function useUserListsContext() {
  const context = useContext(UserListsContext);
  if (context === undefined) {
    throw new Error('useUserListsContext must be used within a UserListsProvider');
  }
  return context;
}
