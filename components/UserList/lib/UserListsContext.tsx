'use client';

import { createContext, useContext, ReactNode, useState, useEffect, FC } from 'react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { ListService } from '@/components/UserList/lib/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
  UserListOverview,
  DEFAULT_LIST_NAME,
} from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage, idMatch } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';
import { ID } from '@/types/root';
import { Button } from '@/components/ui/Button';

interface AddToListToastProps {
  toastId: string;
  onAddToListClick: () => void;
}

export const AddToListToast: FC<AddToListToastProps> = ({ toastId, onAddToListClick }) => (
  <div className="flex items-center gap-3">
    <span>Added to {DEFAULT_LIST_NAME}</span>
    <Button
      variant="link"
      onClick={() => {
        toast.dismiss(toastId);
        onAddToListClick();
      }}
      className="!p-0 !h-auto !text-base text-blue-600 hover:text-blue-700 hover:no-underline font-medium"
    >
      Manage
    </Button>
  </div>
);

export interface ListItemChange {
  listId: ID;
  documentId: ID;
  at: number;
}

interface AddToDefaultListResult {
  listItemId: ID;
  listId: ID;
}

export interface ListItemChange {
  listId: ID;
  documentId: ID;
  at: number;
}

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
  addToDefaultList: (unifiedDocumentId: ID) => Promise<AddToDefaultListResult>;
  lastAddedItem: ListItemChange | null;
  lastRemovedItem: ListItemChange | null;
  overviewLists: UserListOverview[];
  isLoadingOverview: boolean;
  refetchOverview: () => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const [overviewLists, setOverviewLists] = useState<UserListOverview[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [lastAddedItem, setLastAddedItem] = useState<ListItemChange | null>(null);
  const [lastRemovedItem, setLastRemovedItem] = useState<ListItemChange | null>(null);
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
      'List removed',
      'Failed to removed list',
      shouldRefreshLists
    );
  };

  const updateListAndSort = (listsToUpdate: UserList[], listId: ID, updates: Partial<UserList>) =>
    listsToUpdate
      .map((list) =>
        idMatch(list.id, listId)
          ? { ...list, ...updates, updatedDate: new Date().toISOString() }
          : list
      )
      .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());

  const incrementItemCount = (listId: ID) => {
    setLists((lists) => {
      const list = lists.find((l) => idMatch(l.id, listId));
      return updateListAndSort(lists, listId, { itemCount: (list?.itemCount ?? 0) + 1 });
    });
  };

  const decrementItemCount = (listId: ID) => {
    setLists((lists) => {
      const list = lists.find((l) => idMatch(l.id, listId));
      return updateListAndSort(lists, listId, {
        itemCount: Math.max((list?.itemCount ?? 0) - 1, 0),
      });
    });
  };

  const addDocumentToList = (id: ID, unifiedDocumentId: ID, listItemId: ID) => {
    setOverviewLists((lists) =>
      lists.map((list) =>
        idMatch(list.id, id)
          ? {
              ...list,
              unifiedDocuments: [
                ...(list.unifiedDocuments || []),
                { unifiedDocumentId, listItemId },
              ],
            }
          : list
      )
    );
    setLastAddedItem({ listId: id, documentId: unifiedDocumentId, at: Date.now() });
    incrementItemCount(id);
  };

  const removeDocumentFromList = (id: ID, unifiedDocumentId: ID) => {
    setOverviewLists((lists) =>
      lists.map((list) =>
        idMatch(list.id, id)
          ? {
              ...list,
              unifiedDocuments:
                list.unifiedDocuments?.filter(
                  (doc) => !idMatch(doc.unifiedDocumentId, unifiedDocumentId)
                ) ?? [],
            }
          : list
      )
    );
    setLastRemovedItem({ listId: id, documentId: unifiedDocumentId, at: Date.now() });
    decrementItemCount(id);
  };

  const addToDefaultList = async (unifiedDocumentId: ID): Promise<AddToDefaultListResult> => {
    const response = await ListService.addToDefaultListApi(unifiedDocumentId);
    const defaultList = overviewLists.find((list) => list.isDefault);

    if (defaultList) {
      addDocumentToList(defaultList.id, unifiedDocumentId, response.id);
    } else {
      await Promise.all([refetchOverview(), fetchLists()]);
      setLastAddedItem({ listId: response.listId, documentId: unifiedDocumentId, at: Date.now() });
    }

    return { listItemId: response.id, listId: response.listId };
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
    addToDefaultList,
    lastAddedItem,
    lastRemovedItem,
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

interface UseAddToListProps {
  unifiedDocumentId: string | number | null | undefined;
  isInList: boolean;
  onOpenModal: () => void;
}

export function useAddToList({ unifiedDocumentId, isInList, onOpenModal }: UseAddToListProps) {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { addToDefaultList } = useUserListsContext();
  const [isTogglingDefaultList, setIsTogglingDefaultList] = useState(false);

  const handleAddToList = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!unifiedDocumentId) return;

    executeAuthenticatedAction(async () => {
      if (isInList) {
        onOpenModal();
        return;
      }

      setIsTogglingDefaultList(true);
      try {
        await addToDefaultList(Number(unifiedDocumentId));
        toast.success((t) => <AddToListToast toastId={t.id} onAddToListClick={onOpenModal} />);
      } catch (error) {
        toast.error(extractApiErrorMessage(error, 'Failed to add to list'));
      } finally {
        setIsTogglingDefaultList(false);
      }
    });
  };

  return { isTogglingDefaultList, handleAddToList };
}
