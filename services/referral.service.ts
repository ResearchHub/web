import { ApiClient } from './client';
import type {
  TransformedReferralMetrics,
  TransformedNetworkDetailsResult,
  TransformedModNetworkDetailsResult,
} from '@/types/referral';
import {
  transformReferralMetrics,
  transformNetworkDetailsPaginated,
  transformModNetworkDetailsPaginated,
} from '@/types/referral';

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

  // Mock data for development/testing
  private static readonly MOCK_MOD_NETWORK_DATA = {
    results: [
      {
        signup_date: '2024-01-15',
        total_funded: 2500,
        referral_bonus_earned: 125,
        author_id: 1,
        full_name: 'Dr. Sarah Johnson',
        profile_image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        referral_bonus_expiration_date: '2024-07-15',
        is_referral_bonus_expired: false,
        referrer_user: {
          user_id: 101,
          full_name: 'Dr. Michael Chen',
          profile_image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
      },
      {
        signup_date: '2024-02-03',
        total_funded: 1800,
        referral_bonus_earned: 90,
        author_id: 2,
        full_name: 'Prof. David Rodriguez',
        profile_image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        referral_bonus_expiration_date: '2024-08-03',
        is_referral_bonus_expired: false,
        referrer_user: {
          user_id: 102,
          full_name: 'Dr. Emily Watson',
          profile_image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
      },
      {
        signup_date: '2024-01-28',
        total_funded: 3200,
        referral_bonus_earned: 160,
        author_id: 3,
        full_name: 'Dr. Lisa Thompson',
        profile_image:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        referral_bonus_expiration_date: '2024-07-28',
        is_referral_bonus_expired: false,
        referrer_user: {
          user_id: 101,
          full_name: 'Dr. Michael Chen',
          profile_image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
      },
      {
        signup_date: '2023-12-10',
        total_funded: 950,
        referral_bonus_earned: 47.5,
        author_id: 4,
        full_name: 'Prof. James Wilson',
        profile_image:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        referral_bonus_expiration_date: '2024-06-10',
        is_referral_bonus_expired: true,
        referrer_user: {
          user_id: 103,
          full_name: 'Dr. Amanda Foster',
          profile_image:
            'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=150&h=150&fit=crop&crop=face',
        },
      },
      {
        signup_date: '2024-03-12',
        total_funded: 4100,
        referral_bonus_earned: 205,
        author_id: 5,
        full_name: 'Dr. Robert Kim',
        profile_image:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        referral_bonus_expiration_date: '2024-09-12',
        is_referral_bonus_expired: false,
        referrer_user: {
          user_id: 102,
          full_name: 'Dr. Emily Watson',
          profile_image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        },
      },
    ],
    count: 5,
  };

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

  /**
   * Gets mocked moderator network details with referrer information, pagination, and sorting
   * @param params - Pagination and sorting parameters
   * @throws {ReferralError} When the request fails
   */
  static async getModNetworkDetails(params: {
    page: number;
    pageSize: number;
    sortField?: string | null;
    sortDirection?: 'asc' | 'desc' | null;
  }): Promise<TransformedModNetworkDetailsResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Simulate pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      let paginatedResults = this.MOCK_MOD_NETWORK_DATA.results.slice(startIndex, endIndex);

      // Apply sorting if specified
      if (params.sortField && params.sortDirection) {
        paginatedResults = paginatedResults.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          // Handle nested objects
          if (params.sortField === 'referrerUser') {
            aValue = a.referrer_user?.full_name || '';
            bValue = b.referrer_user?.full_name || '';
          } else {
            aValue = a[params.sortField as keyof typeof a];
            bValue = b[params.sortField as keyof typeof b];
          }

          // Handle date sorting
          if (params.sortField === 'signup_date') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          // Handle boolean sorting
          if (params.sortField === 'is_referral_bonus_expired') {
            aValue = aValue ? 1 : 0;
            bValue = bValue ? 1 : 0;
          }

          // Handle numeric sorting
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            if (params.sortDirection === 'asc') {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          }

          // Handle string sorting
          if (params.sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      const mockResponse = {
        results: paginatedResults,
        count: this.MOCK_MOD_NETWORK_DATA.count,
      };

      return transformModNetworkDetailsPaginated(params.pageSize)(mockResponse);
    } catch (error) {
      throw new ReferralError(
        'Failed to fetch moderator network details',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
