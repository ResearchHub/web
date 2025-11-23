export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  item_count?: number;
}

export interface CreateListRequest {
  name: string;
  is_public?: boolean;
}

export interface UpdateListRequest {
  name?: string;
  is_public?: boolean;
}

export interface UserListsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserList[];
}
