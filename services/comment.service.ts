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
import { mapAppContentTypeToApiType } from '@/utils/contentTypeMapping';
import {
  applyDemoReviewOverrides,
  getDemoExpertReviewRawComments,
  isDemoExpertReviewsProposalId,
} from '@/components/work/lib/demoExpertReviews';

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
  mentions: string[];
}

export interface UpdateCommentOptions {
  commentId: ID;
  documentId: ID;
  contentType: ContentType;
  content: string | QuillContent;
  contentFormat?: ContentFormat;
  mentions: string[];
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
    threadType,
    mentions,
  }: CreateCommentOptions): Promise<Comment> {
    const contentTypePath = mapAppContentTypeToApiType(contentType);
    const path =
      `${this.BASE_PATH}/${contentTypePath}/${workId}/comments/` +
      (bountyAmount ? 'create_comment_with_bounty/' : 'create_rh_comment/');

    // Default threadType to commentType if not specified
    const effectiveThreadType = threadType || commentType;

    // Keep thread_type as original value (no mapping)
    const backendThreadType = effectiveThreadType;

    const payload = {
      comment_content_json: content,
      comment_content_type: 'TIPTAP',
      thread_type: backendThreadType,
      privacy_type: privacyType,
      ...(bountyAmount && { amount: bountyAmount, bounty_type: bountyType }),
      ...(expirationDate && { expiration_date: expirationDate }),
      ...(commentType && { comment_type: commentType }),
      ...(parentId && {
        parent_id: parentId,
        comment_type: commentType,
        thread_type: threadType,
      }),
      ...(mentions && { mentions }),
    };

    const response = await ApiClient.post<any>(path, payload);
    const transformedComment = transformComment(response);

    return transformedComment;
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
    const contentTypePath = mapAppContentTypeToApiType(contentType);
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
    let response: CommentResponse;
    if (filter === 'BOUNTY') {
      response = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 88625,
            user_vote: null,
            awarded_bounty_amount: null,
            bounty_creator_id: null,
            created_by: {
              id: 39602,
              author_profile: {
                id: 973869,
                is_verified: true,
                first_name: 'ResearchHub',
                last_name: 'Foundation',
                created_date: '2023-06-05T19:43:38.253368Z',
                updated_date: '2025-05-28T19:31:09.653408Z',
                profile_image:
                  'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/28/blob_aBYdPow',
              },
              editor_of: [],
              is_verified: true,
              first_name: 'Main',
              last_name: 'Account',
            },
            thread: {
              id: 79697,
              content_type: {
                app_label: 'paper',
                model: 'paper',
              },
              privacy_type: 'PUBLIC',
              object_id: 11314212,
              thread_type: 'GENERIC_COMMENT',
              anchor: null,
            },
            children_count: 0,
            children: [],
            purchases: [],
            bounties: [
              {
                id: 7528,
                created_by: {
                  id: 39602,
                  author_profile: {
                    id: 973869,
                    is_verified: true,
                    first_name: 'ResearchHub',
                    last_name: 'Foundation',
                    created_date: '2023-06-05T19:43:38.253368Z',
                    updated_date: '2025-05-28T19:31:09.653408Z',
                    profile_image:
                      'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/28/blob_aBYdPow',
                  },
                },
                solutions: [],
                parent: null,
                expiration_date: '2026-07-10T05:43:16.835415Z',
                bounty_type: 'REVIEW',
                amount: '1920.0000000000',
                status: 'OPEN',
              },
            ],
            review: null,
            parent: null,
            created_date: '2026-06-26T05:43:15.974384Z',
            updated_date: '2026-06-26T05:43:18.210854Z',
            is_public: true,
            is_removed: false,
            is_removed_date: null,
            score: 0,
            context_title: null,
            comment_content_json: {
              ops: [
                {
                  insert: 'ResearchHub Foundation is assigning an incentive of ',
                },
                {
                  insert: '$150 in ResearchCoin (RSC)',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  insert:
                    ' for a high-quality, rigorous, and constructive peer review of this manuscript. If your expertise aligns well with this research, please consider posting your review.\n\n',
                },
                {
                  insert: 'Requirements:',
                  attributes: {
                    bold: true,
                  },
                },
                {
                  insert:
                    '\nVerify identity and complete profile (including ORCID auth) on ResearchHub.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert:
                    'Submit your review within 14 days of the date this bounty was initiated.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert: 'Describe the relevance of your domain expertise to the manuscript.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert: 'Disclose AI use. Please refer to our ',
                },
                {
                  insert: 'AI Policy',
                  attributes: {
                    link: 'https://drive.google.com/file/d/1KihDvQze5rzi8xwleWfMNsdPbc6EF0t_/view',
                  },
                },
                {
                  insert: ' for additional details.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert: 'Disclose conflicts of interest.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert:
                    'Use the rating system in the "Peer Reviews" tab for all 5 criteria: overall assessment, introduction, methods, results, and discussion. Please read our ',
                },
                {
                  insert: 'Peer Review Guide',
                  attributes: {
                    link: 'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/peer-review-program/peer-review-program-guidelines',
                  },
                },
                {
                  insert:
                    ' with details about the process and examples of awarded reviews. Please avoid using other review formats.',
                },
                {
                  insert: '\n',
                  attributes: {
                    list: 'ordered',
                  },
                },
                {
                  insert:
                    '\nEditors will review and award up to 2 high-quality peer reviews within 1 week following the 14 day submission window. All decisions are final. For questions, please contact ',
                },
                {
                  insert: 'editorial@researchhub.foundation',
                  attributes: {
                    link: 'mailto:editorial@researchhub.foundation',
                  },
                },
                {
                  insert: '.\n',
                },
              ],
            },
            comment_content_type: 'QUILL_EDITOR',
            is_accepted_answer: null,
            comment_type: 'GENERIC_COMMENT',
            updated_by: 39602,
          },
        ],
      };
    } else {
      response = await ApiClient.get<CommentResponse>(path);
    }

    let results = [...response.results];
    let count = response.count;

    // Demo-only: append scripted expert reviews below the real API reviews for
    // one specific proposal, on the first page of the REVIEW feed only. They are
    // raw API-shaped objects so they transform and render like any other review.
    const isFirstPage = !page || page === 1;
    if (isDemoExpertReviewsProposalId(documentId) && filter === 'REVIEW' && isFirstPage) {
      const demoComments = getDemoExpertReviewRawComments();
      results.push(...demoComments);
      count += demoComments.length;

      // Rebrand the real "AI Expert" review as "AI Review" and put it (plus
      // Attila's demo review) at the front of the list.
      results = applyDemoReviewOverrides(results);
    }

    return {
      comments: results.map(transformComment),
      count,
    };
  }

  static async updateComment({
    commentId,
    documentId,
    contentType,
    content,
    contentFormat,
    mentions,
  }: UpdateCommentOptions): Promise<Comment> {
    const contentTypePath = mapAppContentTypeToApiType(contentType);
    const path = `${this.BASE_PATH}/${contentTypePath}/${documentId}/comments/${commentId}/`;
    const payload = {
      comment_content_json: content,
      comment_content_type: contentFormat,
      ...(mentions && { mentions }),
    };

    const response = await ApiClient.patch<any>(path, payload);
    return transformComment(response);
  }

  static async deleteComment({
    commentId,
    documentId,
    contentType,
  }: DeleteCommentOptions): Promise<void> {
    const contentTypePath = mapAppContentTypeToApiType(contentType);
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
    const contentTypePath = mapAppContentTypeToApiType(contentType);
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
    const contentTypePath = mapAppContentTypeToApiType(contentType);
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

  /**
   * Fetches all author posts for a document. Backed by the AUTHOR_UPDATE
   * comment filter — the backend constant remains unchanged for compatibility
   * even though the frontend surfaces these as "posts".
   */
  static async fetchAuthorPosts({
    documentId,
    contentType,
  }: {
    documentId: number;
    contentType: ContentType;
  }): Promise<Comment[]> {
    try {
      const { comments } = await this.fetchComments({
        documentId,
        contentType,
        filter: 'AUTHOR_UPDATE',
        sort: 'CREATED_DATE',
        ascending: false, // newest first — consumed by the AuthorPosts carousel
        pageSize: 100,
      });

      return comments;
    } catch (error) {
      console.error('Error fetching author posts:', error);
      return [];
    }
  }
}
