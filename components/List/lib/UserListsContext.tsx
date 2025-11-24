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
import { ListService } from '@/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  SimplifiedUserList,
} from '@/components/List/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';

interface UserListsContextType {
  lists: UserList[];
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  createList: (data: CreateListRequest, refreshLists?: boolean) => Promise<UserList>;
  updateList: (
    listId: number,
    data: UpdateListRequest,
    refreshLists?: boolean
  ) => Promise<UserList>;
  deleteList: (listId: number, refreshLists?: boolean) => Promise<void>;
  overviewLists: SimplifiedUserList[];
  isLoadingOverview: boolean;
  refetchOverview: () => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewLists, setOverviewLists] = useState<SimplifiedUserList[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ListService.getUserListsApi({ page: 1 });
      setLists(response.results || []);
    } catch (err) {
      const errorMsg = extractApiErrorMessage(err, 'Failed to load lists');
      setError(errorMsg);
      console.error('Failed to fetch lists:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchOverview = useCallback(async () => {
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
      fetchLists();
      fetchOverview();
    }
  }, [user, fetchLists, fetchOverview]);

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
        await (refreshLists ? Promise.all([fetchLists(), fetchOverview()]) : fetchOverview());
        return result;
      } catch (err) {
        toast.error(extractApiErrorMessage(err, errorMsg));
        throw err;
      }
    },
    [fetchLists, fetchOverview]
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
      lists,
      isLoading,
      error,
      fetchLists,
      createList,
      updateList,
      deleteList,
      overviewLists,
      isLoadingOverview,
      refetchOverview: fetchOverview,
    }),
    [
      lists,
      isLoading,
      error,
      fetchLists,
      createList,
      updateList,
      deleteList,
      overviewLists,
      isLoadingOverview,
      fetchOverview,
    ]
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
