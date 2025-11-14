'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserLists } from '@/hooks/useUserLists';
import { UserList, CreateListRequest, UpdateListRequest } from '@/types/user-list';

interface UserListsContextType {
  lists: UserList[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  fetchLists: () => void;
  createList: (data: CreateListRequest) => Promise<UserList>;
  updateList: (listId: number, data: UpdateListRequest) => Promise<UserList>;
  deleteList: (listId: number) => Promise<void>;
}

const UserListsContext = createContext<UserListsContextType | undefined>(undefined);

export function UserListsProvider({ children }: { children: ReactNode }) {
  const userLists = useUserLists();

  return <UserListsContext.Provider value={userLists}>{children}</UserListsContext.Provider>;
}

export function useUserListsContext() {
  const context = useContext(UserListsContext);
  if (context === undefined) {
    throw new Error('useUserListsContext must be used within a UserListsProvider');
  }
  return context;
}
