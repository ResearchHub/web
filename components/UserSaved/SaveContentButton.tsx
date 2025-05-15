'use client';

import useUserSaved from '@/hooks/useUserSaved';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/form/Modal';
import { Checkbox } from '../ui/form/Checkbox';
import { Input } from '../ui/form/Input';
import { isValidListName } from '@/utils/validation';
import toast from 'react-hot-toast';
import { ActionButton } from '../Feed/FeedItemActions';
import { Bookmark } from 'lucide-react';
import { UserSavedIdentifier } from '@/types/userSaved';

interface SaveContentButtonProps {
  styling: 'feed' | 'work_item';
  userSavedIdentifier: UserSavedIdentifier;
}

const SaveContentButton = ({ styling, userSavedIdentifier }: SaveContentButtonProps) => {
  const {
    lists,
    isLoading,
    fetchLists,
    fetchFilteredLists,
    createList,
    addListDocument,
    deleteListDocument,
  } = useUserSaved();

  const [isOpen, setIsOpen] = useState<boolean>(false); // Modal open state
  const [newListName, setNewListName] = useState<string>(''); // New list input
  const [newListValid, setNewListValid] = useState<boolean>(false); // New list input valid
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set()); // Track checked lists

  const handleToggleList = useCallback((listName: string) => {
    setSelectedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listName)) {
        newSet.delete(listName);
        handleDeleteFromList(listName);
      } else {
        newSet.add(listName);
        handleSaveToList(listName);
      }
      return newSet;
    });
  }, []);

  const handleSaveToList = useCallback(
    async (listName: string) => {
      try {
        await addListDocument(listName, userSavedIdentifier);
        toast.success('Saved');
      } catch (err: any) {
        toast.error('Failed');
      }
    },
    [userSavedIdentifier]
  );

  const handleDeleteFromList = useCallback(
    async (listName: string) => {
      try {
        await deleteListDocument(listName, userSavedIdentifier);
        toast.success('Removed');
      } catch (err: any) {
        toast.error('Failed');
      }
    },
    [userSavedIdentifier]
  );

  const handleCreateList = useCallback(async () => {
    if (!newListName.trim()) {
      toast.error('List name cannot be empty');
      return;
    }
    try {
      await createList(newListName);
      setNewListName(''); // Clear input
      toast.success(`Created List: ${newListName}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create list');
    }
  }, [newListName, createList]);

  const toggleModal = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isOpen) {
      try {
        await fetchLists();
        const newSelected = await fetchFilteredLists(userSavedIdentifier);
        setSelectedLists(new Set(newSelected));
      } catch (err: any) {
        toast.error(err.message);
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleNewListInput = (e: ChangeEvent<HTMLInputElement>) => {
    const valid: boolean =
      isValidListName(e.target.value) && !isLoading && !lists.includes(e.target.value);

    setNewListValid(valid);
    setNewListName(e.target.value);
  };

  return (
    <div>
      {styling === 'work_item' && (
        <button
          onClick={toggleModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          disabled={isLoading}
        >
          <Bookmark />
          <span>Save</span>
        </button>
      )}

      {styling === 'feed' && (
        <ActionButton
          icon={(props: any) => <Bookmark />}
          tooltip="Save"
          label="Tip"
          onClick={toggleModal}
        />
      )}

      <Modal title="Save to List" isOpen={isOpen} onClose={toggleModal} useGreyBackground={true}>
        <div className="max-h-64 overflow-y-auto">
          {lists.length === 0 ? (
            <p className="text-gray-500">No lists available. Create one below.</p>
          ) : (
            lists.map((listName: string) => (
              <div
                key={listName}
                className="flex items-center space-x-2 py-2 cursor-pointer rounded-md hover:bg-gray-100"
              >
                <Checkbox
                  id={listName}
                  checked={selectedLists.has(listName)}
                  onCheckedChange={() => handleToggleList(listName)}
                  disabled={isLoading}
                  className="pl-1"
                />
                <label htmlFor={listName} className="text-sm font-medium cursor-pointer">
                  {listName}
                </label>
              </div>
            ))
          )}
        </div>

        <div className="mt-1">
          <label htmlFor="newListName" className="text-sm font-medium">
            Create New List
          </label>
          <div className="flex space-x-2 mt-1">
            <Input
              id="newListName"
              value={newListName}
              onChange={handleNewListInput}
              placeholder="Enter list name"
              disabled={isLoading}
            />
            <Button onClick={handleCreateList} disabled={!newListValid}>
              Create
            </Button>
          </div>
          <Button onClick={toggleModal} className="mt-1">
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SaveContentButton;
