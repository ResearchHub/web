import { ApiClient } from './client';
import {
  LeaderboardOverviewResponse,
  LeaderboardReviewersListResponse,
  LeaderboardFundersListResponse,
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

/** Default page size for leaderboard list endpoints. Not passed from consumer. */
export const LEADERBOARD_PAGE_SIZE = 10;

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
   * Fetch a page of top reviewers for a given period.
   * @param period - One of: 7_days, 30_days, 6_months, 1_year, all_time
   * @param page - 1-based page number (default 1)
   * @returns Paginated result with list, total count, and current user entry (or null if unauthenticated / not on list).
   */
  static async fetchReviewers(
    period: string,
    page: number = 1
  ): Promise<{ results: TopReviewer[]; count: number; currentUser: TopReviewer | null }> {
    const params = new URLSearchParams({
      period,
      page: page.toString(),
      page_size: LEADERBOARD_PAGE_SIZE.toString(),
    });
    const rawData = await ApiClient.get<LeaderboardReviewersListResponse>(
      `${this.BASE_PATH}/reviewers/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      const results = rawData.results.map(transformTopReviewer).filter((r) => r.earnedRsc > 0);
      const count = typeof rawData.count === 'number' ? rawData.count : 0;
      const currentUser =
        rawData.current_user != null ? transformTopReviewer(rawData.current_user) : null;
      return { results, count, currentUser };
    }
    console.error('Unexpected response structure for reviewers:', rawData);
    return { results: [], count: 0, currentUser: null };
  }

  /**
   * Fetch a page of top funders for a given period.
   * @param period - One of: 7_days, 30_days, 6_months, 1_year, all_time
   * @param page - 1-based page number (default 1)
   * @returns Paginated result with list, total count, and current user entry (or null if unauthenticated / not on list).
   */
  static async fetchFunders(
    period: string,
    page: number = 1
  ): Promise<{ results: TopFunder[]; count: number; currentUser: TopFunder | null }> {
    const params = new URLSearchParams({
      period,
      page: page.toString(),
      page_size: LEADERBOARD_PAGE_SIZE.toString(),
    });
    const rawData = await ApiClient.get<LeaderboardFundersListResponse>(
      `${this.BASE_PATH}/funders/?${params.toString()}`
    );
    if (rawData && Array.isArray(rawData.results)) {
      const results = rawData.results.map(transformTopFunder).filter((f) => f.totalFunding > 0);
      const count = typeof rawData.count === 'number' ? rawData.count : 0;
      const currentUser =
        rawData.current_user != null ? transformTopFunder(rawData.current_user) : null;
      return { results, count, currentUser };
    }
    console.error('Unexpected response structure for funders:', rawData);
    return { results: [], count: 0, currentUser: null };
  }
}
