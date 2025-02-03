import { AuthorProfile, ID, transformAuthorProfile } from '@/types/user';
import { BaseTransformer } from '@/types/transformer';
import { ContentType } from '@/types/work';
import { ApiClient } from './client';
import {
  Comment,
  CommentFilter,
  CommentSort,
  CommentPrivacyType,
  ContentFormat,
  Thread,
  Bounty,
  QuillContent,
  CommentType,
} from '@/types/comment';

interface FetchCommentsOptions {
  documentId: number;
  contentType: ContentType;
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

export interface CreateCommentOptions {
  workId: ID;
  contentType: ContentType;
  content?: QuillContent | string;
  contentFormat?: ContentFormat;
  threadId?: number;
  parentId?: number;
  privacyType?: CommentPrivacyType;
  bountyAmount?: number;
  bountyType?: CommentType;
  expirationDate?: string;
  commentType?: CommentType;
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

const transformContent = (raw: any): string => {
  if (raw.html) {
    return raw.html;
  }
  return raw.comment_content_json || '';
};

const transformComment: BaseTransformer<any, Comment> = (raw) => ({
  id: raw.id,
  content: transformContent(raw),
  contentFormat: raw.html ? 'HTML' : 'QUILL',
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

export class CommentService {
  private static readonly BASE_PATH = '/api';

  static async createComment({
    workId,
    contentType,
    content,
    contentFormat,
    threadId,
    parentId,
    privacyType = 'PUBLIC',
    bountyAmount,
    bountyType,
    expirationDate,
  }: CreateCommentOptions): Promise<Comment> {
    const path =
      `${this.BASE_PATH}/${contentType.toLowerCase()}/${workId}/comments/` +
      (bountyAmount ? 'create_comment_with_bounty/' : 'create_rh_comment/');

    const payload = {
      comment_content: content,
      content_format: contentFormat,
      thread_id: threadId,
      parent_id: parentId,
      privacy_type: privacyType,
      ...(bountyAmount && { amount: bountyAmount, bounty_type: bountyType }),
      ...(expirationDate && { expiration_date: expirationDate }),
    };

    const response = await ApiClient.post<any>(path, payload);
    return transformComment(response);
  }

  static async fetchComments({
    documentId,
    contentType,
    filter,
    sort = 'BEST',
    page,
    pageSize = 15,
    childPageSize = 9,
    ascending = false,
    privacyType = 'PUBLIC',
  }: FetchCommentsOptions): Promise<{ comments: Comment[]; count: number }> {
    const queryParams = new URLSearchParams({
      page_size: pageSize.toString(),
      child_page_size: childPageSize.toString(),
      ascending: ascending.toString(),
      privacy_type: privacyType,
      sort_by: sort.toLowerCase(),
    });

    if (filter) {
      queryParams.append('filter', filter.toLowerCase());
    }
    if (page) {
      queryParams.append('page', page.toString());
    }

    const path = `${this.BASE_PATH}/${contentType.toLowerCase()}/${documentId}/comments/?${queryParams.toString()}`;
    const response = await ApiClient.get<CommentResponse>(path);

    return {
      comments: response.results.map(transformComment),
      count: response.count,
    };
  }
}
