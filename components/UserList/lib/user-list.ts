import { createTransformer } from '@/types/transformer';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { ID } from '@/types/root';
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
  id: number;
  name: string;
  isPublic: boolean;
  createdDate: string;
  updatedDate: string;
  createdBy?: number;
  itemCount: number;
}

export interface UserListItemDocument {
  contentType: string;
  contentObject: {
    id: number;
    createdDate: string;
    hub?: {
      id: number;
      name: string;
      slug: string;
    };
    category?: string | null;
    subcategory?: string | null;
    reviews?: any[];
    slug: string;
    unifiedDocumentId: number;
    renderableText?: string;
    title: string;
    type: string;
    fundraise?: any;
    grant?: any;
    imageUrl?: string | null;
    bounties?: any[];
    purchases?: any[];
  };
  createdDate: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    headline: string | null;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      isVerified: boolean;
    };
  };
  metrics: {
    votes: number;
    comments: number;
    reviewMetrics?: {
      avg: number;
      count: number;
    };
  };
}

export interface ApiUserListItemDTO {
  id: number;
  parent_list: number;
  unified_document: number;
  created_date: string;
  updated_date: string;
  created_by: number;
  updated_by: number | null;
  document: any;
}

export interface UserListItem {
  id: number;
  parentList: number;
  unifiedDocument: number;
  createdDate: string;
  updatedDate: string;
  createdBy: number;
  updatedBy: number | null;
  document: UserListItemDocument;
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
  transformFeedEntry({
    id: item.document.contentObject.id,
    content_type: item.document.contentType,
    content_object: {
      ...item.document.contentObject,
      created_date: item.document.contentObject.createdDate,
      unified_document_id: item.document.contentObject.unifiedDocumentId,
      renderable_text: item.document.contentObject.renderableText,
      image_url: item.document.contentObject.imageUrl,
    },
    created_date: item.document.createdDate,
    action: 'publish',
    action_date: item.document.createdDate,
    author: {
      ...item.document.author,
      first_name: item.document.author.firstName,
      last_name: item.document.author.lastName,
      profile_image: item.document.author.profileImage,
      user: {
        ...item.document.author.user,
        first_name: item.document.author.user.firstName,
        last_name: item.document.author.user.lastName,
        is_verified: item.document.author.user.isVerified,
      },
    },
    recommendation_id: null,
    metrics: {
      ...item.document.metrics,
      review_metrics: item.document.metrics.reviewMetrics,
    },
  } as RawApiFeedEntry)
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

const transformUserListItemDocument = (raw: any): UserListItemDocument => ({
  contentType: raw.content_type,
  contentObject: {
    id: raw.content_object.id,
    createdDate: raw.content_object.created_date,
    hub: raw.content_object.hub,
    category: raw.content_object.category,
    subcategory: raw.content_object.subcategory,
    reviews: raw.content_object.reviews,
    slug: raw.content_object.slug,
    unifiedDocumentId: raw.content_object.unified_document_id,
    renderableText: raw.content_object.renderable_text,
    title: raw.content_object.title,
    type: raw.content_object.type,
    fundraise: raw.content_object.fundraise,
    grant: raw.content_object.grant,
    imageUrl: raw.content_object.image_url,
    bounties: raw.content_object.bounties,
    purchases: raw.content_object.purchases,
  },
  createdDate: raw.created_date,
  author: {
    id: raw.author.id,
    firstName: raw.author.first_name,
    lastName: raw.author.last_name,
    profileImage: raw.author.profile_image,
    headline: raw.author.headline,
    user: {
      id: raw.author.user.id,
      firstName: raw.author.user.first_name,
      lastName: raw.author.user.last_name,
      email: raw.author.user.email,
      isVerified: raw.author.user.is_verified,
    },
  },
  metrics: {
    votes: raw.metrics.votes,
    comments: raw.metrics.comments,
    reviewMetrics: raw.metrics.review_metrics,
  },
});

export const transformUserListItem = (raw: ApiUserListItemDTO): UserListItem => ({
  id: raw.id,
  parentList: raw.parent_list,
  unifiedDocument: raw.unified_document,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  createdBy: raw.created_by,
  updatedBy: raw.updated_by,
  document: transformUserListItemDocument(raw.document),
});

export const transformUserListsResponse = (raw: ApiUserListsResponse): UserListsResponse => ({
  count: raw.count,
  next: raw.next,
  previous: raw.previous,
  results: raw.results.map(transformUserList),
});
