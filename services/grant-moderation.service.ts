import { ApiClient } from './client';
import { ID } from '@/types/root';

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

  /**
   * Approves a pending grant/RFP
   * @param grantId - The ID of the grant to approve
   * @throws {GrantModerationError} When approval fails
   */
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
