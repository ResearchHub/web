import { ApiClient } from './client';
import { GrantForModal, transformGrantForModal } from '@/types/grant';

export class GrantService {
  private static readonly BASE_PATH = '/api/grant';
  private static readonly POST_PATH = '/api/researchhubpost';

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
   * Applies to a grant with a proposal
   * @param grantId The ID of the grant to apply to
   * @param proposalPostId The post ID of the proposal to use
   * @returns The application response
   */
  static async applyToGrant(
    grantId: string | number,
    proposalPostId: string | number
  ): Promise<any> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${grantId}/application/`, {
      preregistration_post_id: proposalPostId,
    });
    return response;
  }

  static async getGrantsByUser(userId: number): Promise<GrantForModal[]> {
    const response = await ApiClient.get<{ results: any[] }>(
      `${this.POST_PATH}/?created_by=${userId}&document_type=GRANT`
    );
    return response.results.map(transformGrantForModal);
  }
}
