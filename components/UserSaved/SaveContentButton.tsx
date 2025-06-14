'use client';

import useUserSaved from '@/hooks/useUserSaved';
import { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
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

export const SaveContentButton = ({ styling, userSavedIdentifier }: SaveContentButtonProps) => {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingList && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCreatingList]);

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
    try {
      await createList(newListName);
      setNewListName(''); // Clear input
      setNewListValid(false);
      toast.success(`Created List: ${newListName}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create list');
    }
  }, [newListName, createList]);

  const toggleModal = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCreatingList(false);
    setNewListName('');
    setNewListValid(false);
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
    const valid: boolean = isValidListName(e.target.value, lists);
    setNewListValid(valid);
    setNewListName(e.target.value);
  };

  const getFooter = () => {
    if (isCreatingList) {
      return null;
    }
    return (
      <div
        className="flex items-center cursor-pointer rounded-md hover:bg-gray-100"
        onClick={() => setIsCreatingList(true)}
      >
        <Plus id={'create-list'} className="pl-1" />
        <label htmlFor={'create-list'} className="text-sm font-medium cursor-pointer">
          Create List
        </label>
      </div>
    );
  };

  return (
    <div>
      {styling === 'work_item' && (
        <button
          onClick={toggleModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          disabled={isLoading}
        >
          <Bookmark className="text-black" size={18} />
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
        title={isCreatingList ? 'Create List' : 'Save to List'}
        isOpen={isOpen}
        onClose={toggleModal}
        showCloseButton={true}
        headerAction={<Bookmark />}
        maxWidth="max-w-xl"
        minWidth="min-w-[400px]"
        footer={getFooter()}
        showFooterShadow={false}
      >
        <div className="max-h-128 overflow-y-auto">
          {!isCreatingList &&
            lists.map((listName: string) => (
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
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor={listName} className="text-sm font-medium cursor-pointer">
                  {listName}
                </label>
              </div>
            ))}
          {isCreatingList && (
            <>
              <div className="mt-1">
                <Input
                  className="mb-2"
                  ref={inputRef}
                  id="newListName"
                  value={newListName}
                  onChange={handleNewListInput}
                  placeholder="Enter list name"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newListValid) {
                      handleCreateList();
                      setIsCreatingList(false);
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 mt-1 justify-center">
                <Button
                  className="mr-auto"
                  onClick={() => {
                    setIsCreatingList(false);
                    setNewListName('');
                    setNewListValid(false);
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleCreateList();
                    setIsCreatingList(false);
                  }}
                  disabled={!newListValid}
                >
                  Create
                </Button>
              </div>
            </>
          )}
        </div>
      </BaseModal>
    </div>
  );
};

export default SaveContentButton;
