import { ApiClient } from './client';
import type { TransformedReferralMetrics, TransformedNetworkDetailsResult } from '@/types/referral';
import { transformReferralMetrics, transformNetworkDetailsPaginated } from '@/types/referral';

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
      const response = await ApiClient.post<any>(
        `${this.BASE_PATH}/assignment/add_referral_code/`,
        {
          referral_code: params.referral_code,
          user_id: params.user_id,
        }
      );

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

  /**
   * Gets comprehensive referral metrics for the authenticated user
   * @throws {ReferralError} When the request fails
   */
  static async getMyMetrics(): Promise<TransformedReferralMetrics> {
    try {
      const response = await ApiClient.get<any>(`${this.BASE_PATH}/metrics/my_metrics/`);

      return transformReferralMetrics(response);
    } catch (error) {
      throw new ReferralError(
        'Failed to fetch referral metrics',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Gets detailed information about each user in your referral network with pagination
   * @param params - Pagination parameters
   * @throws {ReferralError} When the request fails
   */
  static async getNetworkDetails(params: {
    page: number;
    pageSize: number;
  }): Promise<TransformedNetworkDetailsResult> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('page_size', params.pageSize.toString());

      const url = `${this.BASE_PATH}/metrics/network_details/?${queryParams.toString()}`;

      const response = await ApiClient.get<any>(url);

      return transformNetworkDetailsPaginated(params.pageSize)(response);
    } catch (error) {
      throw new ReferralError(
        'Failed to fetch network details',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
