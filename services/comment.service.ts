import { ApiClient } from './client';
import { CommentResponse, CreateCommentInput, transformCommentResponse } from './types/comment.dto';

export class CommentService {
  private static readonly BASE_PATH = '/api/';

  static async createComment(input: CreateCommentInput): Promise<CommentResponse> {
    const endpoint =
      `${this.BASE_PATH}${input.documentType}/${input.documentId}/comments/` +
      (input.bountyAmount ? 'create_comment_with_bounty/' : 'create_rh_comment/');

    const payload = {
      comment_content_json: input.content,
      thread_type: input.commentType,
      comment_type: input.commentType,
      privacy_type: input.privacy,
      mentions: input.mentions?.filter((value, index, array) => array.indexOf(value) === index),
      ...(input.bountyAmount && { amount: input.bountyAmount, bounty_type: input.bountyType }),
      ...(input.threadId && { thread_id: input.threadId }),
      ...(input.targetHubs && { target_hub_ids: input.targetHubs }),
      ...(input.expirationDate && { expiration_date: input.expirationDate }),
    };

    const response = await ApiClient.post<any>(endpoint, payload);

    return transformCommentResponse(response);
  }
}
