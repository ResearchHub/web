import { ApiClient } from './client';
import type {
  SuspendUserParams,
  SuspendUserResponse,
  ReinstateUserParams,
  ReinstateUserResponse,
  ReinstateUserApiResponse,
} from '@/types/moderation';
import { transformReinstateUserResponse } from '@/types/moderation';

// Service-specific error class
export class UserModerationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'UserModerationError';
  }
}

export class UserModerationService {
  private static readonly BASE_PATH = '/api/user';

  /**
   * Suspends a user account (ban user)
   * @param authorId - The author profile ID of the user to suspend
   * @returns Promise with suspension confirmation
   * @throws {UserModerationError} When suspension fails
   * @example
   * const result = await UserModerationService.suspendUser('123');
   */
  static async suspendUser(authorId: string): Promise<SuspendUserResponse> {
    try {
      const params: SuspendUserParams = { authorId };
      const response = await ApiClient.post<SuspendUserResponse>(
        `${this.BASE_PATH}/censor/`,
        params
      );
      return response;
    } catch (error) {
      console.error(`Error suspending user ${authorId}:`, error);
      throw new UserModerationError('Failed to suspend user. Please try again.', error);
    }
  }

  /**
   * Reinstates a suspended user account
   * @param authorId - The author profile ID of the user to reinstate
   * @returns Promise with updated user data
   * @throws {UserModerationError} When reinstatement fails
   * @example
   * const result = await UserModerationService.reinstateUser('123');
   */
  static async reinstateUser(authorId: string): Promise<ReinstateUserResponse> {
    try {
      const params: ReinstateUserParams = { author_id: authorId }; // API expects snake_case
      const response = await ApiClient.post<ReinstateUserApiResponse>(
        `${this.BASE_PATH}/reinstate/`,
        params
      );
      return transformReinstateUserResponse(response);
    } catch (error) {
      console.error(`Error reinstating user ${authorId}:`, error);
      throw new UserModerationError('Failed to reinstate user. Please try again.', error);
    }
  }
}
