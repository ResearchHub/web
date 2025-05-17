'use client';

import useUserSaved from '@/hooks/useUserSaved';
import { useState, useCallback, ChangeEvent } from 'react';
import { Checkbox } from '../ui/form/Checkbox';
import { isValidListName } from '@/utils/validation';
import toast from 'react-hot-toast';
import { ActionButton } from '../Feed/FeedItemActions';
import { Bookmark, Plus } from 'lucide-react';
import { UserSavedIdentifier } from '@/types/userSaved';
import { BaseModal } from '../ui/BaseModal';
import { Input } from '../ui/form/Input';
import { Button } from '../ui/Button';

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
  const [newListName, setNewListName] = useState<string>('New List'); // New list input
  const [newListValid, setNewListValid] = useState<boolean>(false); // New list input valid
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false); // Create list input open state
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
    setIsCreatingList(false);
    setNewListName('');
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
          icon={(props: any) => <Bookmark size={18} />}
          tooltip="Save to List"
          label="Tip"
          onClick={toggleModal}
        />
      )}

      <BaseModal
        title="Save to List"
        isOpen={isOpen}
        onClose={toggleModal}
        showCloseButton={true}
        headerAction={<Bookmark />}
      >
        <div className="max-h-128 overflow-y-auto">
          {lists.map((listName: string) => (
            <div
              key={listName}
              className="flex items-center space-x-2 py-2 cursor-pointer rounded-md hover:bg-gray-100"
              onClick={() => {
                handleToggleList(listName);
              }}
            >
              <Checkbox
                id={listName}
                checked={selectedLists.has(listName)}
                disabled={isLoading}
                className="pl-1"
              />
              <label htmlFor={listName} className="text-sm font-medium cursor-pointer">
                {listName}
              </label>
            </div>
          ))}
          {!isCreatingList && (
            <div
              className="flex items-center space-x-2 py-2 cursor-pointer rounded-md hover:bg-gray-100"
              onClick={() => setIsCreatingList(true)}
            >
              <Plus id={'create-new-list'} className="pl-1" />
              <label htmlFor={'create-new-list'} className="text-sm font-medium cursor-pointer">
                Create New List
              </label>
            </div>
          )}
          {isCreatingList && (
            <>
              <div className="mt-1">
                <Input
                  id="newListName"
                  value={newListName}
                  onChange={handleNewListInput}
                  placeholder="Enter list name"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => {
                  handleCreateList();
                  setIsCreatingList(false);
                }}
                disabled={!newListValid}
                className="mt-1"
              >
                Create
              </Button>
            </>
          )}
        </div>
      </BaseModal>
    </div>
  );
};

export default SaveContentButton;
