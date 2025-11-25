export interface ApiSimplifiedListItem {
  list_item_id: number;
  unified_document_id: number;
}

export interface ApiSimplifiedUserList {
  list_id: number;
  name: string;
  unified_documents: ApiSimplifiedListItem[];
}

export interface ApiUserCheckResponse {
  lists: ApiSimplifiedUserList[];
}

export interface ApiUserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  item_count?: number;
}

export interface ApiUserListsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUserList[];
}

export interface UserList {
  id: number;
  name: string;
  isPublic: boolean;
  createdDate: string;
  updatedDate: string;
  itemCount?: number;
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

export interface UserListOverviewItem {
  listItemId: number;
  unifiedDocumentId: number;
}

export interface UserListOverview {
  listId: number;
  name: string;
  unifiedDocuments: UserListOverviewItem[];
}

export interface UserListsOverviewResponse {
  lists: UserListOverview[];
}

const transformOverviewItem = (raw: ApiSimplifiedListItem): UserListOverviewItem => ({
  listItemId: raw.list_item_id,
  unifiedDocumentId: raw.unified_document_id,
});

const transformOverviewList = (raw: ApiSimplifiedUserList): UserListOverview => ({
  listId: raw.list_id,
  name: raw.name,
  unifiedDocuments: raw.unified_documents.map(transformOverviewItem),
});

export const transformUserListsOverview = (
  raw: ApiUserCheckResponse
): UserListsOverviewResponse => ({
  lists: raw.lists.map(transformOverviewList),
});

export const transformUserList = (raw: ApiUserList): UserList => ({
  id: raw.id,
  name: raw.name,
  isPublic: raw.is_public,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  itemCount: raw.item_count,
});

export const transformUserListsResponse = (raw: ApiUserListsResponse): UserListsResponse => ({
  count: raw.count,
  next: raw.next,
  previous: raw.previous,
  results: raw.results.map(transformUserList),
});
