import { useState, useCallback, useEffect } from 'react';
import { UserListService, UserListError } from '@/services/userList.service';
import type {
  UserList,
  UserListWithDocuments,
  CreateUserListParams,
  UpdateUserListParams,
  AddDocumentToListParams,
  RemoveDocumentFromListParams,
  AddPermissionParams,
  RemovePermissionParams,
  ListVisibility,
} from '@/types/userList';
import { ID } from '@/types/root';

interface UseUserListsState {
  lists: UserList[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
}

interface UseUserListState {
  list: UserListWithDocuments | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing user lists with pagination
 */
export const useUserLists = (initialVisibility?: ListVisibility) => {
  const [state, setState] = useState<UseUserListsState>({
    lists: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
  });

  const [visibility, setVisibility] = useState<ListVisibility | undefined>(initialVisibility);

  const fetchLists = useCallback(
    async (page = 1, append = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await UserListService.getUserLists({
          visibility,
          page,
          pageSize: 20,
        });

        setState((prev) => ({
          ...prev,
          lists: append ? [...prev.lists, ...response.results] : response.results,
          hasMore: !!response.next,
          page,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to fetch lists'),
          isLoading: false,
        }));
      }
    },
    [visibility]
  );

  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoading) return;
    fetchLists(state.page + 1, true);
  }, [state.hasMore, state.isLoading, state.page, fetchLists]);

  const createList = useCallback(async (params: CreateUserListParams) => {
    try {
      const newList = await UserListService.createUserList(params);
      setState((prev) => ({
        ...prev,
        lists: [newList, ...prev.lists],
      }));
      return newList;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to create list'),
      }));
      throw error;
    }
  }, []);

  const updateList = useCallback(async (listId: string, params: UpdateUserListParams) => {
    try {
      const updatedList = await UserListService.updateUserList(listId, params);
      setState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => (list.id === listId ? updatedList : list)),
      }));
      return updatedList;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to update list'),
      }));
      throw error;
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await UserListService.deleteUserList(listId);
      setState((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to delete list'),
      }));
      throw error;
    }
  }, []);

  const addDocumentToList = useCallback(async (params: AddDocumentToListParams) => {
    try {
      const newDocument = await UserListService.addDocumentToList(params);
      // Update the list's item count
      setState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === params.listId ? { ...list, itemCount: list.itemCount + 1 } : list
        ),
      }));
      return newDocument;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to add document to list'),
      }));
      throw error;
    }
  }, []);

  const removeDocumentFromList = useCallback(async (params: RemoveDocumentFromListParams) => {
    try {
      await UserListService.removeDocumentFromList(params);
      // Update the list's item count
      setState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === params.listId ? { ...list, itemCount: Math.max(0, list.itemCount - 1) } : list
        ),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to remove document from list'),
      }));
      throw error;
    }
  }, []);

  const addPermission = useCallback(async (params: AddPermissionParams) => {
    try {
      await UserListService.addPermission(params);
      // Update the list's shared status
      setState((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list.id === params.listId ? { ...list, isShared: true } : list
        ),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to add permission'),
      }));
      throw error;
    }
  }, []);

  const removePermission = useCallback(async (params: RemovePermissionParams) => {
    try {
      await UserListService.removePermission(params);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to remove permission'),
      }));
      throw error;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLists(1, false);
  }, [fetchLists]);

  return {
    // State
    lists: state.lists,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,

    // Actions
    fetchLists,
    loadMore,
    createList,
    updateList,
    deleteList,
    addDocumentToList,
    removeDocumentFromList,
    addPermission,
    removePermission,

    // Filters
    visibility,
    setVisibility,
  };
};

/**
 * Hook for managing a single user list
 */
export const useUserList = (listId: string | null) => {
  const [state, setState] = useState<UseUserListState>({
    list: null,
    isLoading: false,
    error: null,
  });

  const fetchList = useCallback(async () => {
    if (!listId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const list = await UserListService.getUserList(listId);
      setState({
        list,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        list: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch list'),
      });
    }
  }, [listId]);

  const updateList = useCallback(
    async (params: UpdateUserListParams) => {
      if (!listId) return;

      try {
        const updatedList = await UserListService.updateUserList(listId, params);
        setState((prev) => ({
          ...prev,
          list: prev.list ? { ...prev.list, ...updatedList } : null,
        }));
        return updatedList;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to update list'),
        }));
        throw error;
      }
    },
    [listId]
  );

  const addDocumentToList = useCallback(
    async (params: Omit<AddDocumentToListParams, 'listId'>) => {
      if (!listId) return;

      try {
        const newDocument = await UserListService.addDocumentToList({ ...params, listId });
        setState((prev) => ({
          ...prev,
          list: prev.list
            ? {
                ...prev.list,
                documents: [...prev.list.documents, newDocument],
                itemCount: prev.list.itemCount + 1,
              }
            : null,
        }));
        return newDocument;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to add document to list'),
        }));
        throw error;
      }
    },
    [listId]
  );

  const removeDocumentFromList = useCallback(
    async (documentId: ID) => {
      if (!listId) return;

      try {
        await UserListService.removeDocumentFromList({ listId, documentId });
        setState((prev) => ({
          ...prev,
          list: prev.list
            ? {
                ...prev.list,
                documents: prev.list.documents.filter((doc) => doc.id !== documentId),
                itemCount: Math.max(0, prev.list.itemCount - 1),
              }
            : null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to remove document from list'),
        }));
        throw error;
      }
    },
    [listId]
  );

  const reorderDocuments = useCallback(
    async (documentIds: ID[]) => {
      if (!listId) return;

      try {
        await UserListService.reorderListDocuments(listId, documentIds);
        // Refetch the list to get the updated order
        await fetchList();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to reorder documents'),
        }));
        throw error;
      }
    },
    [listId, fetchList]
  );

  // Load list when listId changes
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    // State
    list: state.list,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    fetchList,
    updateList,
    addDocumentToList,
    removeDocumentFromList,
    reorderDocuments,
  };
};
