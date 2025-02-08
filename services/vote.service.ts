import { ID } from '@/types/root';
import { ApiClient } from './client';
import { DocumentType, transformVote, transformVotes, Vote, VoteTypeString } from '@/types/vote';

export interface VoteOptions {
  documentType: DocumentType;
  documentId: ID;
  voteType: VoteTypeString;
  commentId?: ID;
}

export interface GetVotesOptions {
  paperIds: (string | number)[];
  postIds: (string | number)[];
}

export class VoteService {
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

  static async vote({ documentType, documentId, voteType, commentId }: VoteOptions): Promise<Vote> {
    if (!documentType || !documentId) {
      throw new Error('Document type and ID are required');
    }

    const baseUrl = `${documentType}/${documentId}`;
    const commentPart = commentId ? `/comments/${commentId}` : '';
    const url = `${this.BASE_PATH}/${baseUrl}${commentPart}/${voteType}/`;

    const response = await ApiClient.post<any>(url);

    return transformVote(response);
  }
}
