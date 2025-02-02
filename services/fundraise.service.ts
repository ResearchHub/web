import { ApiClient } from './client';
import { ApiError } from './types';
import {
  CreateContributionPayload,
  FundraiseResponse,
  transformFundraiseResponse,
} from './types/fundraise.dto';

export class FundraiseService {
  private static readonly BASE_PATH = '/api/fundraise';

  static async createContribution(
    id: number,
    payload: CreateContributionPayload
  ): Promise<FundraiseResponse> {
    try {
      const response = await ApiClient.post<any>(
        `${this.BASE_PATH}/${id}/create_contribution/`,
        payload,
        { rawError: true }
      );

      return transformFundraiseResponse(response);
    } catch (error: any) {
      const { data, status } = JSON.parse(error.message);
      const errorMsg = data?.detail || 'Failed to create contribution';
      throw new ApiError(errorMsg, status, data);
    }
  }
}
