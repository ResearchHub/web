import { ApiClient } from './client';
import { FeedEntry, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';

interface GrantFeedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawApiFeedEntry[];
}

export interface GetGrantsParams {
  page?: number;
  pageSize?: number;
  status?: 'OPEN' | 'CLOSED';
  ordering?: 'newest' | 'oldest' | 'best';
  createdBy?: number | string;
}

export class GrantService {
  private static readonly BASE_PATH = '/api/grant';
  private static readonly GRANT_FEED_PATH = '/api/grant_feed';

  /**
   * Fetches grants from the grant feed endpoint
   * @param params Query parameters for filtering grants
   * @returns Array of grant feed entries and pagination info
   */
  static async getGrants(params?: GetGrantsParams): Promise<{
    grants: FeedEntry[];
    hasMore: boolean;
    total: number;
  }> {
    const queryParams = new URLSearchParams();

    queryParams.append('content_type', 'GRANT');
    queryParams.append('page', (params?.page || 1).toString());
    queryParams.append('page_size', (params?.pageSize || 20).toString());

    if (params?.status) {
      queryParams.append('status', params.status);
    }

    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }

    if (params?.createdBy) {
      queryParams.append('created_by', params.createdBy.toString());
    }

    const url = `${this.GRANT_FEED_PATH}/?${queryParams.toString()}`;

    try {
      const response = await ApiClient.get<GrantFeedResponse>(url);

      const grants = response.results
        .map((entry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming grant entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => entry !== null);

      return {
        grants,
        hasMore: !!response.next,
        total: response.count,
      };
    } catch (error) {
      console.error('Error fetching grants:', error);
      return {
        grants: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Creates a new grant
   * @param payload The grant creation payload
   * @returns The created grant object
   */
  static async createGrant(payload: any): Promise<any> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/`, payload);
    return response;
  }

  /**
   * Applies to a grant with a proposal
   * @param grantId The ID of the grant to apply to
   * @param proposalPostId The post ID of the proposal to use
   * @returns The application response
   */
  static async applyToGrant(
    grantId: string | number,
    proposalPostId: string | number
  ): Promise<any> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${grantId}/application/`, {
      preregistration_post_id: proposalPostId,
    });
    return response;
  }
}
