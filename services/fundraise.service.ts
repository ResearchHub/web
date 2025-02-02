import { Fundraise, transformFundraise } from '@/types/funding';
import { ApiClient } from './client';
import { ApiError } from './types';

export class FundraiseService {
  private static readonly BASE_PATH = '/api/fundraise';

  static async createContribution(id: number, payload: any): Promise<Fundraise> {
    try {
      const response = await ApiClient.post<any>(
        `${this.BASE_PATH}/${id}/create_contribution/`,
        payload,
        { rawError: true }
      );

      return transformFundraise(response);
    } catch (error: any) {
      const { data, status } = JSON.parse(error.message);
      const errorMsg = data?.message || 'Failed to create contribution';
      throw new ApiError(errorMsg, status, data);
    }
  }
}
