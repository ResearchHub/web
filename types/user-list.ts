export interface UserList {
  id: number;
  name: string;
  is_public: boolean;
  created_date: string;
  updated_date: string;
  top_authors?: TopAuthor[];
  top_hubs?: TopHub[];
  top_topics?: TopTopic[];
  item_count?: number; // May be in response, or calculated from items
  items_count?: number; // Backend returns this field
}

export interface UserListItem {
  id: number;
  parent_list: number;
  unified_document: number;
  created_date: string;
  unified_document_data?: {
    documents?: Array<{
      id: number;
      title: string;
      slug: string;
      renderable_text?: string;
      abstract?: string;
      authors?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        user?: number;
      }>;
      hubs?: Array<{
        id: number;
        name: string;
        slug: string;
        hub_image?: string;
      }>;
      type?: string;
      image_url?: string;
      institution?: string;
      journal?: any;
    }>;
    hubs?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    document_type?: string;
    created_date?: string;
    unified_document_id?: number;
    created_by?: any;
    fundraise?: {
      id: number;
      status?: string;
      goal_currency?: string;
      goal_amount?: {
        usd?: number;
        rsc?: number;
      };
      amount_raised?: {
        usd?: number;
        rsc?: number;
      };
      start_date?: string;
      end_date?: string;
      contributors?: {
        total?: number;
        top?: Array<{
          id: number;
          author_profile?: {
            id: number;
            first_name?: string;
            last_name?: string;
            profile_image?: string;
            profile_url?: string;
          };
          total_contribution?: number;
          contributions?: Array<any>;
        }>;
      };
      created_date?: string;
      updated_date?: string;
    };
    grant?: {
      id?: number;
      amount?: {
        usd?: number;
        rsc?: number;
        formatted?: string;
      };
      amount_usd?: number;
      amount_rsc?: number;
      organization?: string;
      description?: string;
      status?: string;
      start_date?: string;
      startDate?: string;
      end_date?: string;
      endDate?: string;
      is_expired?: boolean;
      isExpired?: boolean;
      is_active?: boolean;
      isActive?: boolean;
      currency?: string;
      created_by?: any;
      applicants?: Array<any>;
      applications?: Array<any>;
    };
  };
  // Legacy field for backward compatibility (used as fallback in conversion)
  contentType?: 'paper' | 'post' | 'grant' | 'fund' | 'proposal' | 'question';
}

export interface UserListDetail extends UserList {
  items: UserListItem[];
}

export interface TopAuthor {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  count: number;
}

export interface TopHub {
  id: number;
  name: string;
  slug: string;
}

export interface TopCategory {
  id: number;
  name: string;
  itemCount: number;
}

export interface TopTopic {
  id: number;
  name: string;
  itemCount: number;
}

export interface ListStats {
  topAuthors: TopAuthor[];
  topCategories: TopCategory[];
  topTopics: TopTopic[];
}

export interface CreateListRequest {
  name: string;
}

export interface UpdateListRequest {
  name: string;
}

export interface AddItemRequest {
  parent_list: number;
  unified_document: number;
}
