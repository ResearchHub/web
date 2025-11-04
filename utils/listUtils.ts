import { UserList, UserListDetail } from '@/types/user-list';

export function getItemCount(list: UserList | UserListDetail): number {
  if ('items' in list && list.items) {
    return list.items.length;
  }
  return list.items_count ?? list.item_count ?? 0;
}

export function formatItemCount(list: UserList | UserListDetail): string {
  const count = getItemCount(list);
  return formatCount(count);
}

export function formatCount(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}
