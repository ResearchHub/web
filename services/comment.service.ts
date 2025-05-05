import { ContentType } from '@/types/work';
import { ApiClient } from './client';
import {
  Comment,
  CommentFilter,
  CommentSort,
  CommentPrivacyType,
  ContentFormat,
  CommentType,
  QuillContent,
  transformComment,
} from '@/types/comment';
import { ID } from '@/types/root';
import { getContentTypePath } from '@/utils/contentTypeMapping';

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
  threadId?: ID;
  parentId?: ID;
  privacyType?: CommentPrivacyType;
  bountyAmount?: number;
  bountyType?: CommentType;
  expirationDate?: string;
  commentType?: CommentType;
  threadType?: string;
}

export interface UpdateCommentOptions {
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
  content: string | QuillContent;
  contentFormat?: ContentFormat;
}

export interface DeleteCommentOptions {
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
}

export interface CreateCommunityReviewOptions {
  unifiedDocumentId: ID;
  commentId: ID;
  score: number;
}

export interface FetchCommentOptions {
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
}

export interface FetchCommentRepliesOptions {
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
  page?: number;
  pageSize?: number;
  sort?: CommentSort;
  ascending?: boolean;
}

export class CommentService {
  private static readonly BASE_PATH = '/api';

  static async createComment({
    workId,
    contentType,
    content,
    parentId,
    bountyAmount,
    bountyType,
    expirationDate,
    privacyType = 'PUBLIC',
    commentType = 'GENERIC_COMMENT',
    threadType = 'GENERIC_COMMENT',
  }: CreateCommentOptions): Promise<Comment> {
    const contentTypePath = getContentTypePath(contentType);
    const path =
      `${this.BASE_PATH}/${contentTypePath}/${workId}/comments/` +
      (bountyAmount ? 'create_comment_with_bounty/' : 'create_rh_comment/');
    const payload = {
      comment_content_json: content,
      comment_content_type: 'TIPTAP',
      privacy_type: privacyType,
      ...(bountyAmount && { amount: bountyAmount, bounty_type: bountyType }),
      ...(expirationDate && { expiration_date: expirationDate }),
      ...(commentType && { comment_type: commentType }),
      ...(parentId && {
        parent_id: parentId,
        comment_type: commentType,
        thread_type: threadType,
      }),
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
    const contentTypePath = getContentTypePath(contentType);
    const queryParams = new URLSearchParams({
      page_size: pageSize.toString(),
      child_page_size: childPageSize.toString(),
      ascending: ascending.toString(),
      privacy_type: privacyType,
      ordering: sort,
      parent__isnull: 'true',
    });

    if (filter) {
      queryParams.append('filtering', filter);
    }

    if (page) {
      queryParams.append('page', page.toString());
    }

    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/?${queryParams.toString()}`;

    const response = await ApiClient.get<CommentResponse>(path);

    return {
      comments: response.results.map(transformComment),
      count: response.count,
    };
  }

  static async updateComment({
    commentId,
    documentId,
    contentType,
    content,
    contentFormat,
  }: UpdateCommentOptions): Promise<Comment> {
    const contentTypePath = getContentTypePath(contentType);
    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/${commentId}/`;
    const payload = {
      comment_content_json: content,
      comment_content_type: contentFormat,
    };

    const response = await ApiClient.patch<any>(path, payload);
    return transformComment(response);
  }

  static async deleteComment({
    commentId,
    documentId,
    contentType,
  }: DeleteCommentOptions): Promise<void> {
    const contentTypePath = getContentTypePath(contentType);
    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/${commentId}/censor/`;
    await ApiClient.patch(path);
  }

  static async createCommunityReview({
    unifiedDocumentId,
    commentId,
    score,
  }: CreateCommunityReviewOptions): Promise<any> {
    const path = `${this.BASE_PATH}/researchhub_unified_document/${unifiedDocumentId}/review/`;
    const payload = {
      score,
      object_id: commentId,
      content_type: 'rhcommentmodel',
    };

    const response = await ApiClient.post<any>(path, payload);
    return response;
  }

  static async fetchComment({
    commentId,
    documentId,
    contentType,
  }: FetchCommentOptions): Promise<Comment> {
    const contentTypePath = getContentTypePath(contentType);
    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/${commentId}/`;
    const response = await ApiClient.get<any>(path);
    return transformComment(response);
  }

  static async fetchCommentReplies({
    commentId,
    documentId,
    contentType,
    page = 1,
    pageSize = 10,
    sort = 'BEST',
    ascending = false,
  }: FetchCommentRepliesOptions): Promise<{ replies: Comment[]; count: number }> {
    const contentTypePath = getContentTypePath(contentType);
    // Calculate child_offset based on page and pageSize
    const childOffset = (page - 1) * pageSize;

    const queryParams = new URLSearchParams({
      ordering: sort,
      child_count: pageSize.toString(),
      child_offset: childOffset.toString(),
      ascending: ascending.toString(),
    });

    // Note: The URL format is different - we're getting the comment itself with its replies
    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/${commentId}/?${queryParams}`;

    console.log(`[CommentService] Fetching more replies with URL: ${path}`);

    const response = await ApiClient.get<any>(path);

    if (!response) {
      return { replies: [], count: 0 };
    }

    // The response structure is different - the replies are in the children field of the comment
    const replies = (response.children || []).map(transformComment);
    const count = response.children_count || 0;

    return { replies, count };
  }
}
