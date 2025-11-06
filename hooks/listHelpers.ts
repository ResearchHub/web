import { UserListDetail, UserListItem } from '@/types/user-list';

export const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const updateListWithNewItem = (
  prev: UserListDetail | null,
  newItem: UserListItem
): UserListDetail | null =>
  prev
    ? {
        ...prev,
        items: [...prev.items, newItem],
        item_count: (prev.item_count || prev.items?.length || 0) + 1,
      }
    : null;

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

export const updateListAppendItems = (
  prev: UserListDetail | null,
  data: UserListDetail,
  newItems: UserListItem[]
): UserListDetail | null =>
  prev ? { ...prev, ...data, items: [...prev.items, ...newItems] } : data;

export const determineHasMore = <T>(items: T[], pageSize: number): boolean =>
  items.length === pageSize;
