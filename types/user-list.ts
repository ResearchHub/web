export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  top_authors?: TopAuthor[];
  top_hubs?: TopHub[];
  top_topics?: TopTopic[];
  item_count?: number;
  items_count?: number;
}

export interface UserListDetail extends UserList {
  items: UserListItem[];
}

export interface UserListItem {
  id: number;
  unified_document: number;
  created_date: string;
  contentType?: string;
  unified_document_data?: any;
}

export interface TopAuthor {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  count: number;
}

export interface TopHub {
  id: number;
  name: string;
  itemCount: number;
}

export interface TopTopic {
  id: number;
  name: string;
  itemCount: number;
}

export interface TopCategory {
  id: number;
  name: string;
  itemCount: number;
}

export interface ListStats {
  topAuthors?: TopAuthor[];
  topCategories?: TopCategory[];
  topTopics?: TopTopic[];
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
  unified_document: number;
}

export interface UserListsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserList[];
  stats?: ListStats;
}
