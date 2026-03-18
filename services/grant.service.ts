import { ApiClient } from './client';
import { FeedEntry, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { isLikelySpamGrantEntry } from '@/utils/grantSpamDetection';

interface GrantFeedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawApiFeedEntry[];
}

interface AvailableFundingResponse {
  available_funding_in_rsc: number;
  available_funding_in_usd: number;
}

export interface AvailableFunding {
  rsc: number;
  usd: number;
}

export interface GetGrantsParams {
  page?: number;
  pageSize?: number;
  status?: 'OPEN' | 'CLOSED';
  ordering?: 'newest' | 'oldest' | 'best' | 'most_applicants' | 'upvotes' | 'amount_raised';
  createdBy?: number | string;
  excludeLikelySpam?: boolean;
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
    const excludeLikelySpam = params?.excludeLikelySpam ?? true;
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
        .filter((entry): entry is FeedEntry => entry !== null)
        .filter((entry) => !excludeLikelySpam || !isLikelySpamGrantEntry(entry));

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

  static async getAvailableFunding(): Promise<AvailableFunding> {
    try {
      const response = await ApiClient.get<AvailableFundingResponse>(
        `${this.BASE_PATH}/available_funding/`
      );
      return {
        rsc: response.available_funding_in_rsc,
        usd: response.available_funding_in_usd,
      };
    } catch (error) {
      console.error('Error fetching available funding:', error);
      return { rsc: 0, usd: 0 };
    }
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
