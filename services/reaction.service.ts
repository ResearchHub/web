import { ID } from '@/types/root';
import { ApiClient } from './client';

/**
 * ReactionService - Handles user interactions with content
 *
 * This service is for:
 * - Voting on content (papers, posts, comments)
 * - Flagging individual content items (user-facing)
 * - Individual user reactions and engagement
 *
 * For administrative moderation operations, use AuditService instead
 */
import {
  transformFlag,
  transformVote,
  transformVotes,
  Vote,
  VoteTypeString,
  Flag,
  UserVoteType,
  VotableContentType,
} from '@/types/reaction';
import { FlagReasonKey } from '@/types/work';
import { ContentType } from '@/types/work';
import { getContentTypePath } from '@/utils/contentTypeMapping';

export type DocumentType = 'paper' | 'researchhubpost';

export interface VoteOptions {
  documentType: DocumentType;
  documentId: ID; // ID of the document to vote on
  voteType: VoteTypeString;
}

export interface GetVotesOptions {
  paperIds: (string | number)[]; // IDs of papers to check votes for
  postIds: (string | number)[]; // IDs of posts to check votes for
}

export interface FlagOptions {
  documentType: DocumentType;
  documentId: ID; // ID of the document to flag
  reason: FlagReasonKey;
  threadId?: ID;
  commentId?: ID; // ID of the comment to flag (if flagging a comment)
  replyId?: ID;
}

export interface VoteOnCommentOptions {
  commentId: ID; // ID of the comment to vote on
  documentId: ID; // ID of the parent document
  voteType: UserVoteType;
  contentType: VotableContentType;
  documentType: DocumentType;
}

export class ReactionService {
  private static readonly BASE_PATH = '/api';

  static async getVotes(options: GetVotesOptions): Promise<{
    papers: Record<string | number, Vote>;
    posts: Record<string | number, Vote>;
  }> {
    const queryParams = new URLSearchParams();

    if (options.paperIds?.length) {
      queryParams.append('paper_ids', options.paperIds.join(','));
    }

    if (options.postIds?.length) {
      queryParams.append('post_ids', options.postIds.join(','));
    }

    const url = `${this.BASE_PATH}/researchhub_unified_document/check_user_vote/?${queryParams.toString()}`;
    const response = await ApiClient.get<any>(url);

    return transformVotes(response);
  }

  static async voteOnDocument({ documentType, documentId, voteType }: VoteOptions): Promise<Vote> {
    if (!documentType || !documentId) {
      throw new Error('Document type and ID are required');
    }

    const url = `${this.BASE_PATH}/${documentType}/${documentId}/${voteType}/`;
    const response = await ApiClient.post<any>(url);

    return transformVote(response);
  }

  static async voteOnComment({
    commentId,
    documentId,
    voteType,
    contentType,
    documentType,
  }: VoteOnCommentOptions): Promise<any> {
    // Map VotableContentType to ContentType for the API
    let apiContentType: ContentType;

    if (contentType === 'comment') {
      apiContentType = documentType === 'researchhubpost' ? 'post' : 'paper';
    } else if (contentType === 'researchhubpost') {
      apiContentType = 'post';
    } else {
      apiContentType = contentType as ContentType;
    }

    const contentTypePath = getContentTypePath(apiContentType);
    let endpoint = '';

    if (voteType === 'UPVOTE') {
      endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/upvote/`;
    } else if (voteType === 'DOWNVOTE') {
      endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/downvote/`;
    } else {
      endpoint = `/${contentTypePath}/${documentId}/comments/${commentId}/neutralvote/`;
    }

    try {
      return await ApiClient.post(this.BASE_PATH + endpoint);
    } catch (error) {
      // Just rethrow the error to preserve the ApiError structure
      throw error;
    }
  }

  static async flag({ documentType, documentId, reason, commentId }: FlagOptions): Promise<Flag> {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const baseUrl = `${documentType}/${documentId}`;
    const commentPart = commentId ? `/comments/${commentId}` : '';
    const url = `${this.BASE_PATH}/${baseUrl}${commentPart}/flag/`;

    const response = await ApiClient.post(url, { reason });

    return transformFlag(response);
  }
}
