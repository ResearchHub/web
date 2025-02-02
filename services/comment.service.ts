import { ApiClient } from './client';
import { AuthorProfile, transformAuthorProfile } from '@/types/user';
import { BaseTransformer } from '@/types/transformer';

export type CommentFilter = 'BOUNTY' | 'DISCUSSION' | 'REVIEW';
export type CommentSort = 'BEST' | 'NEWEST' | 'TOP';
export type CommentPrivacyType = 'PUBLIC' | 'PRIVATE';
export type ContentFormat = 'QUILL' | 'HTML';

interface UserMention {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  authorProfileId: string | null;
}

interface QuillOperation {
  insert: string | { user: UserMention };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    link?: string;
  };
}

interface QuillContent {
  ops: QuillOperation[];
}

export interface Bounty {
  id: number;
  amount: string;
  status: 'OPEN' | 'CLOSED';
  expirationDate: string;
  bountyType: string;
  createdBy: AuthorProfile;
  raw: any;
}

export interface Thread {
  id: number;
  threadType: string;
  privacyType: CommentPrivacyType;
  objectId: number;
  raw: any;
}

export interface Comment {
  id: number;
  content: QuillContent | string;
  contentFormat: ContentFormat;
  createdDate: string;
  updatedDate: string;
  author: AuthorProfile;
  score: number;
  replyCount: number;
  replies: Comment[];
  bounties: Bounty[];
  thread: Thread;
  isPublic: boolean;
  isRemoved: boolean;
  isAcceptedAnswer: boolean | null;
  raw: any;
}

interface FetchCommentsOptions {
  documentId: number;
  filter?: CommentFilter;
  sort?: CommentSort;
  page?: number;
  pageSize?: number;
  childPageSize?: number;
  ascending?: boolean;
  privacyType?: CommentPrivacyType;
}

interface CommentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

const transformThread: BaseTransformer<any, Thread> = (raw) => ({
  id: raw.id,
  threadType: raw.thread_type,
  privacyType: raw.privacy_type,
  objectId: raw.object_id,
  raw,
});

const transformBounty: BaseTransformer<any, Bounty> = (raw) => ({
  id: raw.id,
  amount: raw.amount,
  status: raw.status,
  expirationDate: raw.expiration_date,
  bountyType: raw.bounty_type,
  createdBy: transformAuthorProfile(raw.created_by),
  raw,
});

const transformContent = (raw: any): QuillContent | string => {
  // Transform based on content_format
  if (raw.content_format === 'QUILL') {
    return raw.comment_content_json;
  }
  return raw.comment_content_src || '';
};

const transformComment: BaseTransformer<any, Comment> = (raw) => ({
  id: raw.id,
  content: transformContent(raw),
  contentFormat: raw.content_format as ContentFormat,
  createdDate: raw.created_date,
  updatedDate: raw.updated_date,
  author: transformAuthorProfile(raw.created_by),
  score: raw.score || 0,
  replyCount: raw.children_count || 0,
  replies: (raw.children || []).map(transformComment),
  bounties: (raw.bounties || []).map(transformBounty),
  thread: transformThread(raw.thread),
  isPublic: raw.is_public,
  isRemoved: raw.is_removed,
  isAcceptedAnswer: raw.is_accepted_answer,
  raw,
});

// Keep the existing mock response
const MOCK_RESPONSE: CommentResponse = {
  count: 3,
  next: null,
  previous: null,
  results: [
    // ... existing mock data ...
  ],
};

export class CommentService {
  private static readonly BASE_PATH = '/api/paper';

  static async fetchComments({
    documentId,
    filter,
    sort = 'BEST',
    page,
    pageSize = 15,
    childPageSize = 9,
    ascending = false,
    privacyType = 'PUBLIC',
  }: FetchCommentsOptions): Promise<{ comments: Comment[]; count: number }> {
    // Return mock data instead of making an API call
    return {
      comments: MOCK_RESPONSE.results.map(transformComment),
      count: MOCK_RESPONSE.count,
    };
  }
}
