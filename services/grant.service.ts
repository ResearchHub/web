import { ApiClient } from './client';
import { Topic } from '@/types/topic';

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

  static async getGrantHubs(): Promise<Topic[]> {
    const path = `/api/grant_feed/hubs/`;
    try {
      const response = await ApiClient.get<any[]>(path);
      return response.map((raw) => ({
        id: raw.id,
        name: raw.name || '',
        slug: raw.slug || '',
        description: raw.description,
        imageUrl: raw.hub_image || undefined,
      }));
    } catch (error) {
      console.error('Error fetching grant hubs:', error);
      return [];
    }
  }
}
