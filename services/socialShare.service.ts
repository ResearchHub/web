import { ApiClient } from './client';
import { ID } from '@/types/root';

export class SocialShareService {
  private static readonly BASE_PATH = '/api/research_ai/share/posts';

  /**
   * AI-written social post text for sharing a proposal or RFP (the link is not
   * included), or `null` while a worker is still writing it. The first miss
   * queues the generation, so callers repeat the request until it is ready.
   * Throws when generation failed.
   */
  static async requestPost(postId: ID): Promise<string | null> {
    const response = await ApiClient.post<{ status: 'ready' | 'pending'; text?: string }>(
      `${this.BASE_PATH}/${postId}/social-post/`
    );
    return response.status === 'ready' ? (response.text ?? null) : null;
  }
}
