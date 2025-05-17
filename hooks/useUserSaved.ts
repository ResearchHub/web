import { useState, useCallback } from 'react';
import { UserSavedService } from '@/services/user-saved.service';
import { FeedEntry } from '@/types/feed';
import { UserSavedIdentifier } from '@/types/userSaved';
import Error from 'next/error';

const useUserSaved = () => {
  const [lists, setLists] = useState<string[]>([]); // Array of list names
  const [listItems, setListItems] = useState<FeedEntry[]>([]); // Array of feed entries for the selected list
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await UserSavedService.getUserLists();
      setLists(data); // Array of list names (string[])
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch lists';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilteredLists = useCallback(async (identifier: UserSavedIdentifier) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: string[] = await UserSavedService.getListsContaining(identifier);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch filtered lists';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchListItems = useCallback(async (listName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: FeedEntry[] = await UserSavedService.getListItems(listName);
      setListItems(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || `Failed to fetch items for list ${listName}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createList = useCallback(async (listName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await UserSavedService.createUserList(listName);
      setLists((prev) => [...prev, listName]); // Optimistically update lists
      return response; // { success: true, list_name }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create list';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addListDocument = useCallback(
    async (listName: string, identifier: UserSavedIdentifier) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = UserSavedService.addListItem(listName, identifier);
        await fetchListItems(listName);
        return response;
      } catch (err: any) {
        const errorMessage =
          err.message || `Failed to add object ${identifier.id} to list ${listName}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchListItems]
  );

  const deleteListDocument = useCallback(
    async (listName: string, identifier: UserSavedIdentifier) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = UserSavedService.deleteListItem(listName, identifier);
        // Optimistically update listItems
        setListItems((prev) => prev.filter((entry) => entry.content.id !== identifier.id));
        return response; // { success: true, list_name, document_id, delete_flag }
      } catch (err: any) {
        const errorMessage = err.message || `Failed to delete ${identifier.id} from ${listName}`;
        setError(errorMessage);
        // throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteList = useCallback(async (listName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await UserSavedService.deleteList(listName);
      setLists((prev) => prev.filter((name) => name !== listName)); // Optimistically remove list
      setListItems([]); // Clear items if the deleted list was active
      return response; // { success: true, list_name }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to delete list ${listName}`;
      setError(errorMessage);
      // throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    lists, // string[]
    listItems, // FeedEntry[]
    isLoading, // boolean
    error, // string | null
    fetchLists,
    fetchFilteredLists,
    fetchListItems,
    createList,
    addListDocument,
    deleteListDocument,
    deleteList,
  };
};

export default useUserSaved;
