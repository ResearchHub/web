import { UserList, UserListDetail } from '@/types/user-list';
import { pluralizeSuffix } from './stringUtils';

export const getItemCount = (list: UserList | UserListDetail): number =>
  'items' in list && Array.isArray(list.items)
    ? list.items.length
    : (list.items_count ?? list.item_count ?? 0);

export const formatItemCount = (list: UserList): string => {
  const count = getItemCount(list);
  return `${count} item${pluralizeSuffix(count)}`;
};

export const updateListRemoveItem = (
  prev: UserListDetail | null,
  itemId: number
): UserListDetail | null =>
  prev
    ? {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
        item_count: Math.max(0, (prev.item_count || prev.items?.length || 0) - 1),
      }
    : null;
