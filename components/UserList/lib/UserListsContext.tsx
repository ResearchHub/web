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
import { ID } from '@/types/root';

interface UserListsContextType {
  lists: UserList[];
  isLoadingLists: boolean;
  isLoadingMoreLists: boolean;
  hasMoreLists: boolean;
  totalListsCount: number;
  errorLoadingLists: string | null;
  loadMoreLists: () => void;
  createList: (data: CreateListRequest, shouldRefreshLists?: boolean) => Promise<UserList>;
  updateList: (id: ID, data: UpdateListRequest, shouldRefreshLists?: boolean) => Promise<UserList>;
  deleteList: (id: ID, shouldRefreshLists?: boolean) => Promise<void>;
  addDocumentToList: (id: ID, unifiedDocumentId: ID, listItemId: ID) => void;
  removeDocumentFromList: (id: ID, unifiedDocumentId: ID) => void;
  overviewLists: UserListOverview[];
  isLoadingOverview: boolean;
  refetchOverview: () => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const [overviewLists, setOverviewLists] = useState<UserListOverview[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [isLoadingMoreLists, setIsLoadingMoreLists] = useState(false);
  const [errorLoadingLists, setErrorLoadingLists] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreLists, setHasMoreLists] = useState(false);
  const [totalListsCount, setTotalListsCount] = useState(0);

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

  const fetchLists = async (pageToFetch = 1, isLoadMore = false) => {
    if (!user) {
      setLists([]);
      setIsLoadingLists(false);
      setIsLoadingMoreLists(false);
      setErrorLoadingLists(null);
      return;
    }

    if (isLoadMore) {
      setIsLoadingMoreLists(true);
    } else {
      setIsLoadingLists(true);
    }
    setErrorLoadingLists(null);

    try {
      const { results, next, count } = await ListService.getUserListsApi({ page: pageToFetch });
      setLists((previousLists) => (isLoadMore ? [...previousLists, ...results] : results));
      setCurrentPage(pageToFetch);
      setHasMoreLists(!!next);
      setTotalListsCount(count);
    } catch (error) {
      setErrorLoadingLists(extractApiErrorMessage(error, 'Failed to load lists'));
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoadingLists(false);
      setIsLoadingMoreLists(false);
    }
  };

  const loadMoreLists = () => {
    if (!hasMoreLists || isLoadingMoreLists) return;
    fetchLists(currentPage + 1, true);
  };

  useEffect(() => {
    if (user) {
      refetchOverview();
      fetchLists();
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
        await Promise.all([refetchOverview(), fetchLists()]);
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

  const updateList = (id: ID, data: UpdateListRequest, shouldRefreshLists = true) =>
    executeListActionWithToast(
      () => ListService.updateListApi(id, data),
      'List updated',
      'Failed to update list',
      shouldRefreshLists
    );

  const deleteList = async (id: ID, shouldRefreshLists = true): Promise<void> => {
    await executeListActionWithToast(
      () => ListService.deleteListApi(id),
      'List deleted',
      'Failed to delete list',
      shouldRefreshLists
    );
  };

  const updateListItemCount = (listId: ID, delta: number) => {
    setLists((lists) =>
      lists.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          itemCount: Math.max(list.itemCount + delta, 0),
        };
      })
    );
  };

  const addDocumentToList = (id: ID, unifiedDocumentId: ID, listItemId: ID) => {
    setOverviewLists((lists) =>
      lists.map((list) => {
        if (list.id !== id) return list;
        return {
          ...list,
          unifiedDocuments: [...(list.unifiedDocuments || []), { unifiedDocumentId, listItemId }],
        };
      })
    );
    updateListItemCount(id, 1);
  };

  const removeDocumentFromList = (id: ID, unifiedDocumentId: ID) => {
    setOverviewLists((lists) =>
      lists.map((list) => {
        if (list.id !== id) return list;

        const filteredDocuments = (list.unifiedDocuments || []).filter(
          (doc) => doc.unifiedDocumentId !== unifiedDocumentId
        );

        return {
          ...list,
          unifiedDocuments: filteredDocuments,
        };
      })
    );
    updateListItemCount(id, -1);
  };

  const value = {
    lists,
    isLoadingLists,
    isLoadingMoreLists,
    hasMoreLists,
    totalListsCount,
    errorLoadingLists,
    loadMoreLists,
    createList,
    updateList,
    deleteList,
    addDocumentToList,
    removeDocumentFromList,
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
