import { ApiClient } from './client';
import { ApiError } from './types';
import { ID } from '@/types/root';
import { ShareLink, ShareLinkApiResponse, transformShareLink } from '@/types/shareLink';

/**
 * Anonymous, expiring read access to a single private proposal.
 *
 * Eligibility is the backend's call: moderators and editors, any author on any
 * version of the proposal, and the creator of a grant it applied to.
 */
export class ShareLinkService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';

  private static path(unifiedDocumentId: ID): string {
    return `${this.BASE_PATH}/${unifiedDocumentId}/share_link/`;
  }

  /**
   * Returns the proposal's active share link, or `null` when sharing is off.
   *
   * Read-only, so it is safe to call when opening the sharing UI — unlike
   * {@link enable}, which mints.
   *
   * @throws {ApiError} 403 when the caller may not manage this proposal's link.
   */
  static async get(unifiedDocumentId: ID): Promise<ShareLink | null> {
    try {
      const response = await ApiClient.get<ShareLinkApiResponse>(this.path(unifiedDocumentId));
      return transformShareLink(response);
    } catch (error) {
      // No link, or one that has since expired.
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Turns sharing on and returns the link.
   *
   * Must run on an explicit user action only. An expired link is regenerated
   * with a fresh token, which permanently retires the URL already handed out —
   * so calling this on render would silently break links in the wild.
   *
   * @throws {ApiError} 403 when the caller is not eligible; 400 when the
   * proposal has not cleared moderation.
   */
  static async enable(unifiedDocumentId: ID): Promise<ShareLink> {
    const response = await ApiClient.post<ShareLinkApiResponse>(this.path(unifiedDocumentId));
    return transformShareLink(response);
  }

  /**
   * Turns sharing off, killing any link already handed out.
   *
   * Idempotent — succeeds whether or not a link existed. Irreversible: turning
   * sharing back on mints a different token, and the old URL stays dead.
   *
   * @throws {ApiError} 403 when the caller is not eligible.
   */
  static async disable(unifiedDocumentId: ID): Promise<void> {
    await ApiClient.deleteNoContent(this.path(unifiedDocumentId));
  }
}
