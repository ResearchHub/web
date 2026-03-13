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

  static async fetchPendingProposals(_page: number = 1): Promise<PendingWorksResponse> {
    return { entries: [], hasMore: false };
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

  static async declineGrant(
    grantId: ID,
    params: { reason_choice: string; reason?: string }
  ): Promise<void> {
    try {
      await ApiClient.post(`${this.BASE_PATH}/${grantId}/decline/`, params);
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to decline RFP',
        error
      );
    }
  }
}
