import { ApiClient } from './client';
import { DocumentType, transformVote, Vote, VoteTypeString } from '@/types/vote';
import { ID } from '@/types/root';

export interface VoteOptions {
  documentType: DocumentType;
  documentId: ID;
  voteType: VoteTypeString;
  commentId?: ID;
}

export class VoteService {
  private static readonly BASE_PATH = '/api';

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
