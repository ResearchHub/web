/**
 * This component is a modal that allows the user to create a new list.
 */

import { useState, useCallback, useEffect } from 'react';
import { BaseModal } from '../ui/BaseModal';
import { Input } from '../ui/form/Input';
import { Button } from '../ui/Button';
import { isValidListName } from '@/utils/validation';
import toast from 'react-hot-toast';
import useUserSaved from '@/hooks/useUserSaved';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: string[];
  createList: (listName: string) => Promise<void>;
}

export const CreateListModal = ({ isOpen, onClose, lists, createList }: CreateListModalProps) => {
  const [newListName, setNewListName] = useState<string>('');
  const [newListValid, setNewListValid] = useState<boolean>(false);

  const handleNewListInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valid: boolean = isValidListName(e.target.value, lists);
    setNewListValid(valid);
    setNewListName(e.target.value);
  };

  const handleCreateList = useCallback(async () => {
    try {
      await createList(newListName);
      setNewListName(''); // Clear input
      setNewListValid(false);
      toast.success(`Created List: ${newListName}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create list');
    }
  }, [newListName, createList, onClose]);

  return (
    <BaseModal title="Create List" isOpen={isOpen} onClose={onClose} showCloseButton={true}>
      <div className="space-y-4">
        <Input
          type="text"
          value={newListName}
          onChange={handleNewListInput}
          placeholder="Enter list name"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newListValid) {
              handleCreateList();
            }
          }}
        />
        <Button onClick={handleCreateList} disabled={!newListValid} className="w-full">
          Create List
        </Button>
      </div>
    </BaseModal>
  );
};
