import { Fundraise, transformFundraise } from '@/types/funding';
import { ApiClient } from './client';
import { ApiError } from './types';

export class FundraiseService {
  private static readonly BASE_PATH = '/api/fundraise';

  static async createContribution(id: number, payload: any): Promise<Fundraise> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${id}/create_contribution/`,
      payload
    );

    return transformFundraise(response);
  }
}
