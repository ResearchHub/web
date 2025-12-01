import { createTransformer } from '@/types/transformer';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { ID } from '@/types/root';
export interface ApiSimplifiedListItem {
  list_item_id: ID;
  unified_document_id: ID;
}

export interface ApiSimplifiedUserList {
  list_id: ID;
  name: string;
  unified_documents: ApiSimplifiedListItem[];
}

export interface ApiUserCheckResponse {
  lists: ApiSimplifiedUserList[];
}

export interface ApiUserList {
  id: ID;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  created_by?: number;
  item_count?: number;
}

export interface ApiUserListsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUserList[];
}

export interface UserList {
  id: ID;
  name: string;
  isPublic: boolean;
  createdDate: string;
  updatedDate: string;
  createdBy?: number;
  itemCount: number;
}

export interface ApiUserListItemDTO {
  id: ID;
  parent_list: ID;
  unified_document: ID;
  created_date: string;
  updated_date: string;
  created_by: number;
  updated_by: number | null;
  document: any;
}

export interface UserListItem {
  id: ID;
  parentList: ID;
  unifiedDocument: ID;
  createdDate: string;
  updatedDate: string;
  createdBy: number;
  updatedBy: number | null;
  document: RawApiFeedEntry;
}

export interface UserListDetail extends UserList {
  items: UserListItem[];
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
  listItemId: ID;
  unifiedDocumentId: ID;
}

export interface UserListOverview {
  id: ID;
  name: string;
  unifiedDocuments: UserListOverviewItem[];
}

export interface UserListsOverviewResponse {
  lists: UserListOverview[];
}

export const transformListItemToFeedEntry = createTransformer<UserListItem, FeedEntry>((item) =>
  transformFeedEntry(item.document)
);

const transformOverviewItem = (raw: ApiSimplifiedListItem): UserListOverviewItem => ({
  listItemId: raw.list_item_id,
  unifiedDocumentId: raw.unified_document_id,
});

const transformOverviewList = (raw: ApiSimplifiedUserList): UserListOverview => ({
  id: raw.list_id,
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
  createdBy: raw.created_by,
  itemCount: raw.item_count ?? 0,
});

export const transformUserListItem = (raw: ApiUserListItemDTO): UserListItem => ({
  id: raw.id,
  parentList: raw.parent_list,
  unifiedDocument: raw.unified_document,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  createdBy: raw.created_by,
  updatedBy: raw.updated_by,
  document: {
    ...raw.document,
    id: raw.document?.id ?? raw.document?.content_object?.id ?? raw.unified_document,
    action: raw.document?.action ?? 'publish',
    action_date: raw.document?.action_date ?? raw.document?.created_date ?? raw.created_date,
    content_type: raw.document?.content_type ?? 'paper',
  },
});

export const transformUserListsResponse = (raw: ApiUserListsResponse): UserListsResponse => ({
  count: raw.count,
  next: raw.next,
  previous: raw.previous,
  results: raw.results.map(transformUserList),
});
