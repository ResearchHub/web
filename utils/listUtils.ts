import { UserList } from '@/types/user-list';
import { pluralizeSuffix } from './stringUtils';

export const formatItemCount = (list: UserList) => {
  const n = list.items_count ?? list.item_count ?? 0;
  return `${n} item${pluralizeSuffix(n)}`;
};
