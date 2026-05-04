import { ApiClient } from './client';
import { FunderOverview, transformFunderOverview } from '@/types/funder';

export class FunderService {
  private static readonly BASE_PATH = '/api/funder';

  static async getFundingOverview(userId?: number): Promise<FunderOverview> {
    const query = userId ? `?user_id=${userId}` : '';
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/funding_overview/${query}`);
    return transformFunderOverview(response);
  }
}
