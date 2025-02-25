import { Fundraise, transformFundraise } from '@/types/funding';
import { ApiClient } from './client';
import { ID } from '@/types/root';

export class FundraiseService {
  private static readonly BASE_PATH = '/api/fundraise';

  static async createContribution(id: ID, payload: any): Promise<Fundraise> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${id}/create_contribution/`,
      payload
    );

    return transformFundraise(response);
  }
}
