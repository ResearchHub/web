import { ApiClient } from './client';
import { ContentType } from '@/types/work';
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

interface CreateCommentOptions {
  workId: number;
  contentType: ContentType;
  content: QuillContent | string;
  contentFormat: ContentFormat;
  parentId?: number;
  privacyType?: CommentPrivacyType;
  commentType?: CommentType;
  threadType?: string;
}

export class CommentService {
  private static readonly BASE_PATH = '/api';

  static async createComment({
    workId,
    contentType,
    content,
    contentFormat,
    parentId,
    privacyType = 'PUBLIC',
    commentType = 'GENERIC_COMMENT',
    threadType = 'GENERIC_COMMENT',
  }: CreateCommentOptions): Promise<Comment> {
    const path = `${this.BASE_PATH}/${contentType.toLowerCase()}/${workId}/comments/create_rh_comment/`;

    const payload = {
      comment_content: content,
      content_format: contentFormat,
      privacy_type: privacyType,
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
      sort_by: sort.toLowerCase(),
      parent__isnull: 'true',
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
