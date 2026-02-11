import { ApiClient } from './client';
import {
  LeaderboardOverviewResponse,
  LeaderboardReviewersListResponse,
  LeaderboardFundersListResponse,
  LeaderboardMeResponse,
  TopReviewer,
  TopFunder,
  transformTopReviewer,
  transformTopFunder,
} from '@/types/leaderboard';

interface TransformedLeaderboardOverview {
  reviewers: TopReviewer[];
  funders: TopFunder[];
}

/** Default page size for leaderboard list endpoints. */
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
   * @returns Paginated result with list and total count.
   */
  static async fetchReviewers(
    period: string,
    page: number = 1
  ): Promise<{ results: TopReviewer[]; count: number }> {
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
      return { results, count };
    }
    console.error('Unexpected response structure for reviewers:', rawData);
    return { results: [], count: 0 };
  }

  /**
   * Fetch a page of top funders for a given period.
   * @param period - One of: 7_days, 30_days, 6_months, 1_year, all_time
   * @param page - 1-based page number (default 1)
   * @returns Paginated result with list and total count.
   */
  static async fetchFunders(
    period: string,
    page: number = 1
  ): Promise<{ results: TopFunder[]; count: number }> {
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
      return { results, count };
    }
    console.error('Unexpected response structure for funders:', rawData);
    return { results: [], count: 0 };
  }

  /**
   * Fetch current user's leaderboard entries for a period (reviewer and funder).
   * @param period - One of: 7_days, 30_days, 6_months, 1_year, all_time
   */
  static async fetchCurrentUserLeaderboard(
    period: string
  ): Promise<{ reviewer: TopReviewer | null; funder: TopFunder | null }> {
    try {
      const params = new URLSearchParams({ period });
      const rawData = await ApiClient.get<LeaderboardMeResponse>(
        `${this.BASE_PATH}/me?${params.toString()}`
      );
      if (!rawData) return { reviewer: null, funder: null };
      const reviewer = rawData.reviewer != null ? transformTopReviewer(rawData.reviewer) : null;
      const funder = rawData.funder != null ? transformTopFunder(rawData.funder) : null;
      return { reviewer, funder };
    } catch {
      return { reviewer: null, funder: null };
    }
  }
}
