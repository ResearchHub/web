import { ApiClient } from './client';
import { ApiError } from './types';
import { ID } from '@/types/root';
import { ShareLink, ShareLinkApiResponse, transformShareLink } from '@/types/shareLink';

export class ShareLinkService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';

  private static path(unifiedDocumentId: ID): string {
    return `${this.BASE_PATH}/${unifiedDocumentId}/share_link/`;
  }

  /** Returns the active share link, or `null` when sharing is off. */
  static async get(unifiedDocumentId: ID): Promise<ShareLink | null> {
    try {
      const response = await ApiClient.get<ShareLinkApiResponse>(this.path(unifiedDocumentId));
      return transformShareLink(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Turns sharing on and returns the link. Call only on an explicit user action:
   * an expired link is reissued with a new token, retiring the URL already sent out.
   */
  static async enable(unifiedDocumentId: ID): Promise<ShareLink> {
    const response = await ApiClient.post<ShareLinkApiResponse>(this.path(unifiedDocumentId));
    return transformShareLink(response);
  }

  /** Turns sharing off, killing any link already sent out. Idempotent. */
  static async disable(unifiedDocumentId: ID): Promise<void> {
    await ApiClient.deleteNoContent(this.path(unifiedDocumentId));
  }
}
