'use client';

import { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { Checkbox } from '../ui/form/Checkbox';
import { isValidListName } from '@/utils/validation';
import toast from 'react-hot-toast';
import { Bookmark, Plus } from 'lucide-react';
import { UserSavedIdentifier } from '@/types/userSaved';
import { BaseModal } from '../ui/BaseModal';
import { Input } from '../ui/form/Input';
import { Button } from '../ui/Button';

interface SucceededFlag {
  success: boolean;
}

interface UserSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSavedIdentifier: UserSavedIdentifier;
  lists: string[];
  isLoading: boolean;
  createList: (listName: string) => Promise<SucceededFlag>;
  addListDocument: (listName: string, identifier: UserSavedIdentifier) => Promise<SucceededFlag>;
  deleteListDocument: (
    listName: string,
    identifier: UserSavedIdentifier
  ) => Promise<SucceededFlag | undefined>;
  fetchFilteredLists: (identifier: UserSavedIdentifier) => Promise<string[]>;
}

export const UserSavedModal = ({
  isOpen,
  onClose,
  userSavedIdentifier,
  lists,
  isLoading,
  createList,
  addListDocument,
  deleteListDocument,
  fetchFilteredLists,
}: UserSavedModalProps) => {
  const [newListName, setNewListName] = useState<string>('New List');
  const [newListValid, setNewListValid] = useState<boolean>(false);
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [pendingActions, setPendingActions] = useState<
    Array<{ action: 'add' | 'remove'; listName: string }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingList && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCreatingList]);

  useEffect(() => {
    if (isOpen) {
      const initializeSelectedLists = async () => {
        try {
          const newSelected = await fetchFilteredLists(userSavedIdentifier);
          setSelectedLists(new Set(newSelected));
        } catch (err: any) {
          toast.error(err.message);
        }
      };
      initializeSelectedLists();
    }
  }, [isOpen, userSavedIdentifier, fetchFilteredLists]);

  // Handle pending actions after state updates
  useEffect(() => {
    if (pendingActions.length > 0) {
      const processActions = async () => {
        for (const { action, listName } of pendingActions) {
          try {
            if (action === 'add') {
              await addListDocument(listName, userSavedIdentifier);
              toast.success('Saved');
            } else {
              await deleteListDocument(listName, userSavedIdentifier);
              toast.success('Removed');
            }
          } catch (err: any) {
            toast.error('Failed');
          }
        }
        setPendingActions([]);
      };
      processActions();
    }
  }, [pendingActions, userSavedIdentifier, addListDocument, deleteListDocument]);

  const handleToggleList = useCallback((listName: string) => {
    setSelectedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listName)) {
        newSet.delete(listName);
        setPendingActions((prev) => [...prev, { action: 'remove', listName }]);
      } else {
        newSet.add(listName);
        setPendingActions((prev) => [...prev, { action: 'add', listName }]);
      }
      return newSet;
    });
  }, []);

  const handleCreateList = useCallback(async () => {
    try {
      await createList(newListName);
      setNewListName('');
      setNewListValid(false);
      toast.success(`Created List: ${newListName}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create list');
    }
  }, [newListName, createList]);

  const handleClose = useCallback(() => {
    setIsCreatingList(false);
    setNewListName('');
    setNewListValid(false);
    onClose();
  }, [onClose]);

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
    <BaseModal
      title={isCreatingList ? 'Create List' : 'Save to List'}
      isOpen={isOpen}
      onClose={handleClose}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleList(listName);
                }}
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
                    e.preventDefault();
                    e.stopPropagation();
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
  );
};
