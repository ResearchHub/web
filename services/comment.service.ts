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
    const path =
      `${this.BASE_PATH}/${contentType.toLowerCase()}/${workId}/comments/` +
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

    const path = `${this.BASE_PATH}/${contentType.toLowerCase()}/${documentId}/comments/?${queryParams.toString()}`;
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
    const path = `${this.BASE_PATH}/${contentType.toLowerCase()}/${documentId}/comments/${commentId}/`;
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
    const path = `${this.BASE_PATH}/${contentType.toLowerCase()}/${documentId}/comments/${commentId}/censor/`;
    await ApiClient.delete(path);
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
}
