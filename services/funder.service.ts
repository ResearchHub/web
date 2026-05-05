import { ApiClient } from './client';
import { ActivityService, type GetActivityParams } from './activity.service';
import { FunderOverview, transformFunderOverview } from '@/types/funder';
import type { FeedEntry } from '@/types/feed';

export class FunderService {
  private static readonly BASE_PATH = '/api/funder';

  static async getFundingOverview(userId?: number): Promise<FunderOverview> {
    const query = userId ? `?user_id=${userId}` : '';
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/funding_overview/${query}`);
    return transformFunderOverview(response);
  }

  /**
   * Fetch the activity feed scoped to a single funder
   * (peer reviews, author updates, contributions, etc. across all of their grants).
   * Backed by the activity_feed endpoint with `funder_id` set.
   */
  static async getActivity(
    funderId: number,
    options?: Omit<GetActivityParams, 'funderId'>
  ): Promise<{ entries: FeedEntry[]; hasMore: boolean; count: number }> {
    return ActivityService.getActivity({ ...options, funderId });
  }
}
