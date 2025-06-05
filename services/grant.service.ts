import { ApiClient } from './client';

export class GrantService {
  private static readonly BASE_PATH = '/api/grant';

  /**
   * Creates a new grant
   * @param payload The grant creation payload
   * @returns The created grant object
   */
  static async createGrant(payload: any): Promise<any> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/`, payload);
    return response;
  }

  /**
   * Applies to a grant with a preregistration
   * @param grantId The ID of the grant to apply to
   * @param preregistrationPostId The post ID of the preregistration to use
   * @returns The application response
   */
  static async applyToGrant(
    grantId: string | number,
    preregistrationPostId: string | number
  ): Promise<any> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${grantId}/application/`, {
      preregistration_post_id: preregistrationPostId,
    });
    return response;
  }
}
