import { List } from 'lucide-react';
import { FeedContent } from '../Feed/FeedContent';
import { Alert } from '../ui/Alert';
import { FeedEntry } from '@/types/feed';
import { UserSavedIdentifier } from '@/types/userSaved';
import { MainPageHeader } from '../ui/MainPageHeader';
interface UserListFocusViewProps {
  loading: boolean;
  listItems: FeedEntry[];
  focusedList: string;
  deleteListDocument: (listName: string, identifier: UserSavedIdentifier) => void;
}

/**
 * This is a debug view for User Saved Content.
 * It is here for reference and for manipulating lists, or testing, not necessarily for deployment.
 */
export default function UserListFocusView({
  loading,
  listItems,
  focusedList,
  deleteListDocument,
}: UserListFocusViewProps) {
  if (!loading && listItems.length === 0) {
    return (
      <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600 text-center">
        You haven't saved any items yet. You can save content by clicking the Save button on the
        feed or while viewing it.
      </div>
    );
  }
  return (
    <FeedContent
      isRenderingSavedList={true}
      deleteUserSavedContent={(identifier: UserSavedIdentifier) =>
        deleteListDocument(focusedList, identifier)
      }
      entries={listItems}
      isLoading={loading}
      hasMore={false}
      loadMore={() => {}}
      activeTab="latest"
    />
  );
}
