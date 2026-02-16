import { ApiClient } from './client';
import { roundRscAmount } from './lib/serviceUtils';
import { Fundraise, transformFundraise } from '@/types/funding';
import { ID } from '@/types/root';

export class FundraiseService {
  private static readonly BASE_PATH = '/api/fundraise';

  /**
   * Fetches a fundraise by its ID
   * @param id The fundraise ID
   * @returns The fundraise object
   */
  static async getFundraise(id: ID): Promise<Fundraise> {
    const response = await ApiClient.get<any>(`${this.BASE_PATH}/${id}/`);
    return transformFundraise(response);
  }

  /**
   * Contribute to a fundraise with RSC or USD
   * @param fundraiseId The ID of the fundraise to contribute to
   * @param amount The amount to contribute
   * @param currency The currency type ('usd' or 'rsc'), defaults to 'rsc'
   * @returns The updated fundraise
   */
  static async contributeToFundraise(
    fundraiseId: ID,
    amount: number,
    currency: 'usd' | 'rsc' = 'rsc'
  ): Promise<Fundraise> {
    // Round RSC amounts to 3 decimal places for API compatibility
    const finalAmount = currency === 'rsc' ? roundRscAmount(amount) : amount;

    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${fundraiseId}/create_contribution/`,
      {
        amount: finalAmount,
        currency,
      }
    );
    return transformFundraise(response);
  }

  /**
   * Close a fundraise
   * @param fundraiseId The ID of the fundraise to close
   * @returns The updated fundraise with CLOSED status
   */
  static async closeFundraise(fundraiseId: ID): Promise<Fundraise> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${fundraiseId}/close/`);
    return transformFundraise(response);
  }

  /**
   * Complete a fundraise
   * @param fundraiseId The ID of the fundraise to complete
   * @returns The updated fundraise with COMPLETED status
   */
  static async completeFundraise(fundraiseId: ID): Promise<Fundraise> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${fundraiseId}/complete/`);
    return transformFundraise(response);
  }

  /**
   * Alias for contributeToFundraise to maintain backwards compatibility with existing hooks
   * @param id The ID of the fundraise to contribute to
   * @param payload The payload containing the amount and optional currency
   * @returns The updated fundraise
   */
  static async createContribution(id: ID, payload: any): Promise<Fundraise> {
    return this.contributeToFundraise(id, payload.amount, payload.currency || 'rsc');
  }

  /**
   * Create a contribution to a fundraise via Endaoment (DAF).
   * @param fundraiseId The ID of the fundraise to contribute to
   * @param amount The contribution amount in USD
   * @returns The updated fundraise
   */
  static async createEndaomentContribution(fundraiseId: ID, amount: number): Promise<Fundraise> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${fundraiseId}/create_contribution/`,
      {
        origin_fund_id: fundraiseId,
        amount,
        amount_currency: 'USD',
      }
    );
    return transformFundraise(response);
  }
}
