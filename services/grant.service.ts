import { ApiClient } from './client';

export class GrantService {
  private static readonly BASE_PATH = '/api/grant';

  /**
   * Creates a new grant
   * @param payload The grant creation payload
   * @returns The created grant object
   */
  static async createGrant(payload: any): Promise<any> {
    return ApiClient.post<any>(`${this.BASE_PATH}/`, payload);
  }

  /**
   * Applies to a grant with a proposal
   * @param grantId The ID of the grant to apply to
   * @param proposalPostId The post ID of the proposal to use
   * @returns The application response
   */
  static async applyToGrant(
    grantId: string | number,
    proposalPostId: string | number
  ): Promise<any> {
    return ApiClient.post<any>(`${this.BASE_PATH}/${grantId}/application/`, {
      preregistration_post_id: proposalPostId,
    });
  }

  /**
   * Updates a grant's fields
   */
  static async update(grantId: number, payload: Record<string, any>): Promise<any> {
    return ApiClient.patch<any>(`${this.BASE_PATH}/${grantId}/`, payload);
  }
}
