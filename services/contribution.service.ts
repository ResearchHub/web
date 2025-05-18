import { ApiClient } from './client';
import { ApiError } from './types';
import type { Contribution, ContributionListResponse } from '@/types/contribution';
import { ID } from '@/types/root';

export type ContributionType = 'CONVERSATION' | 'ARTICLE' | 'REVIEW' | 'BOUNTY' | 'ALL';

export interface GetContributionsParams {
  contribution_type?: ContributionType;
  author_id?: ID;
  cursor?: string;
}

export class ContributionError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ContributionError';
  }
}

export class ContributionService {
  private static readonly BASE_PATH = '/api';

  /**
   * Fetches contributions with optional filtering
   * @param params - Optional parameters for filtering contributions
   * @throws {ContributionError} When the request fails or parameters are invalid
   */
  static async getContributions(
    params?: GetContributionsParams
  ): Promise<ContributionListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.contribution_type) {
        queryParams.append('contribution_type', params.contribution_type);
      }

      if (params?.author_id) {
        queryParams.append('author_id', params.author_id.toString());
      }

      if (params?.cursor) {
        queryParams.append('cursor', params.cursor);
      }

      const queryString = queryParams.toString();
      const url = `${this.BASE_PATH}/contribution/latest_contributions/${queryString ? `?${queryString}` : ''}`;

      const response = await ApiClient.get<any>(url);

      if (!response || !Array.isArray(response.results)) {
        throw new ContributionError('Invalid response format', 'INVALID_RESPONSE');
      }

      return {
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        results: response.results,
      };
    } catch (error) {
      if (error instanceof ContributionError) {
        throw error;
      }

      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to fetch contributions';
      throw new ContributionError(errorMsg);
    }
  }

  /**
   * Loads the next page of contributions if available
   * @param currentResponse - The current response containing the next page URL
   * @throws {ContributionError} When the request fails or no next page is available
   */
  static async loadMore(
    currentResponse: ContributionListResponse
  ): Promise<ContributionListResponse> {
    if (!currentResponse.next) {
      throw new ContributionError('No more contributions available', 'NO_MORE_RESULTS');
    }

    try {
      // The next property contains the full URL for the next page
      const response = await ApiClient.get<any>(currentResponse.next);

      if (!response || !Array.isArray(response.results)) {
        throw new ContributionError('Invalid response format', 'INVALID_RESPONSE');
      }

      return {
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        results: response.results,
      };
    } catch (error) {
      if (error instanceof ContributionError) {
        throw error;
      }

      const { data = {} } = error instanceof ApiError ? JSON.parse(error.message) : {};
      const errorMsg = data?.detail || 'Failed to load more contributions';
      throw new ContributionError(errorMsg);
    }
  }
}
