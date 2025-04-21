import { ApiClient } from './client';
import {
  LeaderboardOverviewResponse,
  LeaderboardReviewersResponse,
  LeaderboardFundersResponse,
  TopReviewer,
  TopFunder,
  transformTopReviewer,
  transformTopFunder,
  RawTopReviewer,
  RawTopFunder,
} from '@/types/leaderboard';

interface TransformedLeaderboardOverview {
  reviewers: TopReviewer[];
  funders: TopFunder[];
}

// Define structure for paginated/structured list responses
interface ListApiResponse<T> {
  results: T[];
  // Add other pagination fields like count, next, previous if they exist
}

export class LeaderboardService {
  private static readonly BASE_PATH = '/api/leaderboard';

  /**
   * Fetch the leaderboard overview data (top reviewers and funders)
   * and transform it into the application's format.
   */
  static async fetchLeaderboardOverview(): Promise<TransformedLeaderboardOverview> {
    const rawData = await ApiClient.get<LeaderboardOverviewResponse>(`${this.BASE_PATH}/overview`);

    // Transform the raw data
    const transformedData: TransformedLeaderboardOverview = {
      reviewers: rawData.reviewers.map(transformTopReviewer),
      funders: rawData.funders.map(transformTopFunder),
    };

    return transformedData;
  }

  /**
   * Fetch the detailed list of top reviewers within a date range.
   */
  static async fetchReviewers(startDate: string, endDate: string): Promise<TopReviewer[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const rawData = await ApiClient.get<ListApiResponse<RawTopReviewer>>(
      `${this.BASE_PATH}/reviewers/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      return rawData.results.map(transformTopReviewer);
    } else {
      console.error('Unexpected response structure for reviewers:', rawData);
      return [];
    }
  }

  /**
   * Fetch the detailed list of top funders within a date range.
   */
  static async fetchFunders(startDate: string, endDate: string): Promise<TopFunder[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const rawData = await ApiClient.get<ListApiResponse<RawTopFunder>>(
      `${this.BASE_PATH}/funders/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      return rawData.results.map(transformTopFunder);
    } else {
      console.error('Unexpected response structure for funders:', rawData);
      return [];
    }
  }
}
