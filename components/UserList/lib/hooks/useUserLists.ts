import { useState, useEffect } from 'react';
import { ListService } from '@/components/UserList/lib/services/list.service';
import {
  UserList,
  CreateListRequest,
  UpdateListRequest,
} from '@/components/UserList/lib/user-list';
import { toast } from 'react-hot-toast';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';

export function useUserLists() {
  const { user } = useUser();
  const [lists, setLists] = useState<UserList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLists = async (pageToFetch = 1, isLoadMore = false) => {
    if (!user) {
      setLists([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      return;
    }

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { results, next, count } = await ListService.getUserListsApi({ page: pageToFetch });
      setLists((previousLists) => (isLoadMore ? [...previousLists, ...results] : results));
      setCurrentPage(pageToFetch);
      setHasMore(!!next);
      setTotalCount(count);
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Failed to load lists'));
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return;
    fetchLists(currentPage + 1, true);
  };

  useEffect(() => {
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const executeListActionAndRefetch = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await action();
      toast.success(successMessage);
      await fetchLists();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, errorMessage));
      console.error(errorMessage, error);
      throw error;
    }
  };

  return {
    lists,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    createList: (data: CreateListRequest) =>
      executeListActionAndRefetch(
        () => ListService.createListApi(data),
        'List created',
        'Failed to create list'
      ),
    updateList: (id: number, data: UpdateListRequest) =>
      executeListActionAndRefetch(
        () => ListService.updateListApi(id, data),
        'List updated',
        'Failed to update list'
      ),
    deleteList: (id: number) =>
      executeListActionAndRefetch(
        () => ListService.deleteListApi(id),
        'List deleted',
        'Failed to delete list'
      ),
  };
}
