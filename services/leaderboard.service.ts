import { ApiClient } from './client';
import {
  LeaderboardOverviewResponse,
  TopReviewer,
  TopFunder,
  transformTopReviewer,
  transformTopFunder,
} from '@/types/leaderboard';

interface TransformedLeaderboardOverview {
  reviewers: TopReviewer[];
  funders: TopFunder[];
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
}
