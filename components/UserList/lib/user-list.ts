import { createTransformer } from '@/types/transformer';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
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

export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  created_by?: number;
  item_count?: number;
}

export interface UserListItem {
  id: number;
  parent_list: number;
  unified_document: number;
  created_date: string;
  updated_date: string;
  created_by: number;
  updated_by: number | null;
  document: {
    content_type: string;
    content_object: {
      id: number;
      created_date: string;
      hub?: {
        id: number;
        name: string;
        slug: string;
      };
      category?: string | null;
      subcategory?: string | null;
      reviews?: any[];
      slug: string;
      unified_document_id: number;
      renderable_text?: string;
      title: string;
      type: string;
      fundraise?: any;
      grant?: any;
      image_url?: string | null;
      bounties?: any[];
      purchases?: any[];
    };
    created_date: string;
    author: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image: string | null;
      headline: string | null;
      user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        is_verified: boolean;
      };
    };
    metrics: {
      votes: number;
      comments: number;
      review_metrics?: {
        avg: number;
        count: number;
      };
    };
  };
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

export interface AddItemRequest {
  parent_list: number;
  unified_document: number;
}

export interface ListApiResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
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

export const transformListItemToFeedEntry = createTransformer<UserListItem, FeedEntry>((item) =>
  transformFeedEntry({
    id: item.document.content_object.id,
    content_type: item.document.content_type,
    content_object: item.document.content_object,
    created_date: item.document.created_date,
    action: 'publish',
    action_date: item.document.created_date,
    author: item.document.author,
    recommendation_id: null,
    metrics: item.document.metrics,
  } as RawApiFeedEntry)
);

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
