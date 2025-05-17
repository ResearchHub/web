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
      <Alert className="my-4">
        You haven't saved any items. You may save papers by clicking the Save button on the feed or
        while viewing a paper.
      </Alert>
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
