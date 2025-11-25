import { UserList } from '@/components/UserList/lib/user-list';
import { pluralizeSuffix } from '@/utils/stringUtils';

export const formatItemCount = (list: UserList) => {
  const n = list.itemCount ?? 0;
  return `${n} item${pluralizeSuffix(n)}`;
};
