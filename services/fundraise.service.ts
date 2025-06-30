import { ApiClient } from './client';
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
   * Contribute to a fundraise with RSC
   * @param fundraiseId The ID of the fundraise to contribute to
   * @param amount The amount of RSC to contribute
   * @returns The updated fundraise
   */
  static async contributeToFundraise(fundraiseId: ID, amount: number): Promise<Fundraise> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${fundraiseId}/create_contribution/`,
      {
        amount,
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
   * Alias for contributeToFundraise to maintain backwards compatibility with existing hooks
   * @param id The ID of the fundraise to contribute to
   * @param payload The payload containing the amount
   * @returns The updated fundraise
   */
  static async createContribution(id: ID, payload: any): Promise<Fundraise> {
    return this.contributeToFundraise(id, payload.amount);
  }
}
