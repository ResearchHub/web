export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  created_by?: number;
  item_count?: number;
  items_count?: number;
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
    id: number;
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
    action_date: string;
    action: string;
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
      replies: number;
      review_metrics: {
        avg: number;
        count: number;
      };
    };
    hot_score_v2?: number;
    hot_score_breakdown?: any;
    external_metadata?: any;
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

export interface UserListsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserList[];
}

export interface SimplifiedListItem {
  list_item_id: number;
  unified_document_id: number;
}

export interface SimplifiedUserList {
  list_id: number;
  name: string;
  unified_documents: SimplifiedListItem[];
}

export interface UserCheckResponse {
  lists: SimplifiedUserList[];
}
