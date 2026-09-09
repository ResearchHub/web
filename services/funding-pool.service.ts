import { ApiClient } from './client';
import { roundRscAmount } from './lib/serviceUtils';
import { FundingPool, transformFundingPool } from '@/types/grant';
import { ID } from '@/types/root';

export interface CreateFundingPoolContributionParams {
  amount: number;
  useCredits?: boolean;
}

export interface DistributeFundingPoolParams {
  amount: number;
  applicationId: ID;
}

/**
 * Service for RFP community FundingPool APIs.
 * Distinct from FundraiseService — proposal crowdfunding stays on /api/fundraise/.
 */
export class FundingPoolService {
  private static readonly POOL_BASE_PATH = '/api/funding_pool';

  /**
   * Contribute RSC (wallet balance or funding credits) into the pool.
   * Pool contributions are RSC-only.
   *
   * @param poolId - Funding pool id
   * @param params - Contribution amount and whether to use funding credits
   * @returns The updated funding pool
   */
  static async createContribution(
    poolId: ID,
    params: CreateFundingPoolContributionParams
  ): Promise<FundingPool> {
    const response = await ApiClient.post<any>(
      `${this.POOL_BASE_PATH}/${poolId}/create_contribution/`,
      {
        amount: roundRscAmount(params.amount),
        amount_currency: 'RSC',
        use_credits: params.useCredits ?? false,
      }
    );
    return transformFundingPool(response);
  }

  /**
   * Allocate pool holdings into an open proposal fundraise via its grant application.
   *
   * @param poolId - Funding pool id
   * @param params - RSC amount and application id (not post/fundraise id)
   * @returns The updated funding pool
   */
  static async distribute(poolId: ID, params: DistributeFundingPoolParams): Promise<FundingPool> {
    const response = await ApiClient.post<any>(`${this.POOL_BASE_PATH}/${poolId}/distribute/`, {
      amount: roundRscAmount(params.amount),
      application_id: params.applicationId,
    });
    return transformFundingPool(response);
  }
}
