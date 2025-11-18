import { UserList } from '@/types/user-list';

export const formatItemCount = (list: UserList) => {
  const n = list.items_count ?? list.item_count ?? 0;
  return `${n} item${n !== 1 ? 's' : ''}`;
};
