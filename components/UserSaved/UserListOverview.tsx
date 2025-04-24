import { Trash } from 'lucide-react';
import { Button } from '../ui/Button';

interface UserSavedListProps {
  userSavedItems: string[];
  loading: boolean;
  error: string | null;
  handleTakeFocus: (listName: string) => void;
  handleDelete: (listName: string) => void;
}

export default function UserListOverview({
  userSavedItems,
  loading,
  error,
  handleTakeFocus,
  handleDelete,
}: UserSavedListProps) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
        {error}
      </div>
    );
  }

  if (!userSavedItems?.length) {
    return (
      <div className="p-4 text-sm rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
        Nothing Saved
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <>
        {userSavedItems.map((listName) => (
          <div key={listName} className="flex flex-row rounded-lg mb-2 hover:bg-gray-100">
            <div className="my-auto ml-2">{listName}</div>
            <Button
              className="ml-auto mr-2"
              size={'icon'}
              onClick={() => {
                handleTakeFocus(listName);
              }}
            >
              View
            </Button>
            <Button
              size={'icon'}
              onClick={() => {
                handleDelete(listName);
              }}
            >
              <Trash />
            </Button>
          </div>
        ))}
      </>
    </div>
  );
}
