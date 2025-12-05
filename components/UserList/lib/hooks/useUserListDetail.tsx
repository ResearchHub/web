import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ListService } from '@/components/UserList/lib/services/list.service';
import { UserListDetail } from '@/components/UserList/lib/user-list';
import { extractApiErrorMessage, idMatch } from '@/services/lib/serviceUtils';
import { updateListRemoveItem, removeItemByDocumentId } from '@/components/UserList/lib/listUtils';
import { useUserListsContext, ListItemChange } from '@/components/UserList/lib/UserListsContext';
import { ID } from '@/types/root';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 20;

interface UseUserListDetailOptions {
  readonly onItemMutated?: () => void;
}

export function useUserListDetail(id: ID, options?: UseUserListDetailOptions) {
  const { addDocumentToList, removeDocumentFromList, lastAddedItem, lastRemovedItem } =
    useUserListsContext();
  const [list, setList] = useState<UserListDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const fetchList = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [listData, itemsResponse] = await Promise.all([
        ListService.getListByIdApi(id),
        ListService.getListItemsApi(id, { page: 1, pageSize: PAGE_SIZE }),
      ]);

      setList({ ...listData, items: itemsResponse.results || [] });
      setHasMore(!!itemsResponse.next);
      setCurrentPageNumber(1);
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Failed to load list'));
      console.error('Failed to load list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading || isLoadingMore || !list) return;

    setIsLoadingMore(true);

    try {
      const itemsResponse = await ListService.getListItemsApi(list.id, {
        page: currentPageNumber + 1,
        pageSize: PAGE_SIZE,
      });

      setList((previousList) =>
        previousList
          ? { ...previousList, items: [...previousList.items, ...(itemsResponse.results || [])] }
          : null
      );
      setHasMore(!!itemsResponse.next);
      setCurrentPageNumber((previousPageNumber) => previousPageNumber + 1);
    } catch (error) {
      setError(extractApiErrorMessage(error, 'Failed to load more items'));
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchList();
    } else {
      setList(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      setHasMore(false);
      setCurrentPageNumber(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const lastHandled = useRef({ added: 0, removed: 0 });

  const setChangeFromFeedOnListItems = (change: ListItemChange | null, type: 'added' | 'removed') =>
    change && change.at > lastHandled.current[type] && idMatch(change.listId, id);

  useEffect(() => {
    if (setChangeFromFeedOnListItems(lastAddedItem, 'added')) {
      lastHandled.current.added = lastAddedItem!.at;
      fetchList();
    }
    if (setChangeFromFeedOnListItems(lastRemovedItem, 'removed')) {
      lastHandled.current.removed = lastRemovedItem!.at;
      setList((previousList) => removeItemByDocumentId(previousList, lastRemovedItem!.documentId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedItem, lastRemovedItem, id]);

  const removeItem = async (itemId: ID, unifiedDocumentId: ID) => {
    if (!list) return;
    try {
      await ListService.removeItemFromListApi(list.id, itemId);
      setList((previousList) => updateListRemoveItem(previousList, itemId));
      removeDocumentFromList(list.id, unifiedDocumentId);

      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <span className="text-gray-900">Item removed</span>
            <Button
              variant="link"
              onClick={async (e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
                await addItem(unifiedDocumentId);
              }}
              className="!p-0 !h-auto !text-base text-blue-600 hover:text-blue-700 hover:no-underline font-medium"
            >
              Undo
            </Button>
          </div>
        ),
        { duration: 4000 }
      );
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to remove item'));
      console.error('Failed to remove item:', error);
    }
  };

  const addItem = async (unifiedDocumentId: ID) => {
    if (!list) return;
    try {
      const response = await ListService.addItemToListApi(list.id, unifiedDocumentId);
      await fetchList();
      lastHandled.current.added = Date.now();
      addDocumentToList(list.id, unifiedDocumentId, response.id);
      toast.success('Item added');
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to add item'));
      console.error('Failed to add item:', error);
    }
  };

  const updateListDetails = (updatedListData: Partial<UserListDetail>) => {
    setList((previousList) => (previousList ? { ...previousList, ...updatedListData } : null));
  };

  return {
    list,
    items: list?.items || [],
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    removeItem,
    addItem,
    updateListDetails,
  };
}
