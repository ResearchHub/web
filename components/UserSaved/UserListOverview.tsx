import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { BaseMenuItem } from '../ui/form/BaseMenu';
import { BaseMenu } from '../ui/form/BaseMenu';
import { UserSavedListSkeleton } from './UserSavedListSkeleton';
import { Alert } from '../ui/Alert';

interface UserSavedListProps {
  userSavedLists: string[];
  loading: boolean;
  error: string | null;
  handleTakeFocus: (listName: string) => void;
  handleDelete: (listName: string) => void;
}

export default function UserListOverview({
  userSavedLists,
  loading,
  error,
  handleTakeFocus,
  handleDelete,
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

  if (error) {
    return (
      <div className="p-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
        {error}
      </div>
    );
  }

  if (userSavedLists?.length === 0) {
    return (
      <Alert variant="info" className="my-4">
        You haven't created any lists yet.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col">
      {userSavedLists.map((listName) => (
        <div
          key={listName}
          className="flex flex-row rounded-lg mb-2 hover:bg-gray-100 cursor-pointer"
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
              Delete
            </BaseMenuItem>
          </BaseMenu>
        </div>
      ))}
    </div>
  );
}
