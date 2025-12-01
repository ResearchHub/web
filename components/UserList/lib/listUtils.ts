import { UserList, UserListDetail, UserListOverview } from '@/components/UserList/lib/user-list';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { idMatch } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';

export const formatItemCount = (list: UserList) => {
  const n = list.itemCount;
  return `${n} item${pluralizeSuffix(n)}`;
};

export const updateListRemoveItem = (
  list: UserListDetail | null,
  itemId: ID
): UserListDetail | null => {
  if (!list) return null;
  return {
    ...list,
    items: list.items.filter((item) => !idMatch(item.id, itemId)),
    itemCount: Math.max(list.itemCount - 1, 0),
  };
};

export const sortListsByDocumentMembership = (
  allLists: UserListOverview[],
  listIdsContainingDocument: ID[]
): UserListOverview[] => {
  const listsAlreadyContainingDocument: UserListOverview[] = [];
  const listsNotYetContainingDocument: UserListOverview[] = [];

  for (const list of allLists) {
    if (listIdsContainingDocument.some((id) => idMatch(id, list.id))) {
      listsAlreadyContainingDocument.push(list);
    } else {
      listsNotYetContainingDocument.push(list);
    }
  }

  return [...listsAlreadyContainingDocument, ...listsNotYetContainingDocument];
};

export { transformListItemToFeedEntry } from '@/components/UserList/lib/user-list';
