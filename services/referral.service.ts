import { ApiClient } from './client';
import { ApiError } from './types';

export class ReferralError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ReferralError';
  }
}

export interface AddReferralCodeParams {
  referral_code: string;
  user_id: number;
}

export interface AddReferralCodeResponse {
  success: boolean;
  message?: string;
}

export class ReferralService {
  private static readonly BASE_PATH = '/api/referral';

  /**
   * Adds a referral code to an existing user
   * @param params - The referral code and user ID
   * @throws {ReferralError} When the request fails or parameters are invalid
   */
  static async addReferralCode(params: AddReferralCodeParams): Promise<AddReferralCodeResponse> {
    if (!params.referral_code || !params.user_id) {
      throw new ReferralError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.post<any>(`${this.BASE_PATH}/add_referral_code/`, {
        referral_code: params.referral_code,
        user_id: params.user_id,
      });

      return {
        success: true,
        message: response.message || 'Referral code applied successfully',
      };
    } catch (error) {
      throw new ReferralError(
        'Failed to apply referral code',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
