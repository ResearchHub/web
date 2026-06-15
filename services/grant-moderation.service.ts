import { ApiClient } from './client';
import { ID } from '@/types/root';
import { FeedApiResponse, FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';

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
      const response = await ApiClient.get<FeedApiResponse>(
        `${this.BASE_PATH}/pending/?page=${page}`
      );
      const entries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming pending grant entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => entry !== null);

      return {
        entries,
        hasMore: !!response.next,
      };
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to fetch pending RFPs',
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

  static async closeGrant(grantId: ID): Promise<void> {
    try {
      await ApiClient.post(`${this.BASE_PATH}/${grantId}/close/`, {});
    } catch (error) {
      throw new GrantModerationError(
        error instanceof Error ? error.message : 'Failed to close RFP',
        error
      );
    }
  }
}
