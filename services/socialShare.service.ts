import { ApiClient } from './client';
import { ID } from '@/types/root';

export class SocialShareService {
  private static readonly BASE_PATH = '/api/research_ai/share/posts';

  /** AI-written social post text for sharing a proposal or RFP (the link is not included). */
  static async generatePost(postId: ID): Promise<string> {
    const response = await ApiClient.post<{ text: string }>(
      `${this.BASE_PATH}/${postId}/social-post/`
    );
    return response.text;
  }
}
