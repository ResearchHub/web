import { ApiClient } from './client';
import { ID } from '@/types/root';
import { FeedService } from './feed.service';
import { FeedEntry } from '@/types/feed';

export interface PendingWorksResponse {
  entries: FeedEntry[];
  hasMore: boolean;
}

export class GrantModerationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'GrantModerationError';
  }
}

export class GrantModerationService {
  private static readonly BASE_PATH = '/api/grant';

  static async fetchPendingGrants(page: number = 1): Promise<PendingWorksResponse> {
    try {
      return await FeedService.getFeed({
        endpoint: 'grant_feed',
        page,
        status: 'PENDING',
      });
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to fetch pending RFPs',
        error
      );
    }
  }

  static async fetchPendingProposals(page: number = 1): Promise<PendingWorksResponse> {
    try {
      return await FeedService.getFeed({
        endpoint: 'funding_feed',
        page,
        status: 'PENDING',
      });
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to fetch pending proposals',
        error
      );
    }
  }

  static async approveGrant(grantId: ID): Promise<void> {
    try {
      await ApiClient.post(`${this.BASE_PATH}/${grantId}/approve/`, {});
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to approve RFP',
        error
      );
    }
  }

  /**
   * Declines a pending grant/RFP with an optional reason
   * @param grantId - The ID of the grant to decline
   * @param reason - Optional reason for declining
   * @throws {GrantModerationError} When decline fails
   */
  static async declineGrant(grantId: ID, reason?: string): Promise<void> {
    try {
      await ApiClient.post(`${this.BASE_PATH}/${grantId}/decline/`, {
        ...(reason && { reason }),
      });
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to decline RFP',
        error
      );
    }
  }
}
