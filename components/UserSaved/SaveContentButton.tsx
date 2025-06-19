'use client';

import useUserSaved from '@/hooks/useUserSaved';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ActionButton } from '../Feed/FeedItemActions';
import { Bookmark } from 'lucide-react';
import { UserSavedIdentifier } from '@/types/userSaved';
import { UserSavedModal } from '../modals/UserSavedModal';

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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleModal = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isOpen) {
      try {
        await fetchLists();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
    setIsOpen((prev) => !prev);
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

      <UserSavedModal
        isOpen={isOpen}
        onClose={toggleModal}
        userSavedIdentifier={userSavedIdentifier}
        lists={lists}
        isLoading={isLoading}
        createList={createList}
        addListDocument={addListDocument}
        deleteListDocument={deleteListDocument}
        fetchFilteredLists={fetchFilteredLists}
      />
    </div>
  );
};

export default SaveContentButton;
