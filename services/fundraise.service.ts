import { ApiClient } from './client';
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
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${id}/create_contribution/`,
      payload
    );

    return transformFundraiseResponse(response);
  }
}
