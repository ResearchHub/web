import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { BaseMenuItem } from '../ui/form/BaseMenu';
import { BaseMenu } from '../ui/form/BaseMenu';
import { UserSavedListSkeleton } from './UserSavedListSkeleton';
import { Alert } from '../ui/Alert';
import { useState } from 'react';
import { CreateListModal } from './CreateListModal';

interface UserSavedListProps {
  userSavedLists: string[];
  loading: boolean;
  error: string | null;
  handleTakeFocus: (listName: string) => void;
  handleDelete: (listName: string) => void;
  handleCreateList: (listName: string) => Promise<any>;
  fetchLists: () => Promise<string[]>;
}

export default function UserListOverview({
  userSavedLists,
  loading,
  error,
  handleTakeFocus,
  handleDelete,
  handleCreateList,
}: UserSavedListProps) {
  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className={index > 0 ? 'mt-12' : ''}>
            <UserSavedListSkeleton />
          </div>
        ))}
      </>
    );
  }

  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  if (error) {
    return (
      <div className="p-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <>
      <CreateListModal
        isOpen={isOpen}
        onClose={toggleModal}
        lists={userSavedLists}
        createList={handleCreateList}
      />
      <div
        className="flex flex-row rounded-lg mb-2 bg-indigo-50 cursor-pointer border border-gray-500"
        onClick={toggleModal}
      >
        <div className="flex flex-row my-2 ml-2 flex-1 text-center">
          <em>Create List</em>
        </div>
        <Plus className="text-gray-600 mr-7 mt-2" />
      </div>
      <div className="flex flex-col">
        {userSavedLists.map((listName) => (
          <div
            key={listName}
            className="flex flex-row rounded-lg mb-2 hover:bg-gray-100 cursor-pointer border border-gray-400"
            onClick={() => handleTakeFocus(listName)}
          >
            <div className="my-auto ml-2">{listName}</div>
            <BaseMenu
              trigger={
                <Button variant="ghost" size="lg" className="ml-auto">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              }
              align="start"
            >
              <BaseMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(listName);
                }}
              >
                Remove
              </BaseMenuItem>
            </BaseMenu>
          </div>
        ))}
      </div>
    </>
  );
}
