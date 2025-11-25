import {
  UserList,
  UserListDetail,
  transformListItemToFeedEntry as _transformListItemToFeedEntry,
} from '@/components/UserList/lib/user-list';
import { pluralizeSuffix } from '@/utils/stringUtils';

export const formatItemCount = (list: UserList) => {
  const n = list.itemCount ?? 0;
  return `${n} item${pluralizeSuffix(n)}`;
};

export const updateListRemoveItem = (
  list: UserListDetail | null,
  itemId: number
): UserListDetail | null => {
  if (!list) return null;
  return {
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
    itemCount: (list.itemCount ?? 0) - 1,
  };
};

// Re-export for convenience
export const transformListItemToFeedEntry = _transformListItemToFeedEntry;
