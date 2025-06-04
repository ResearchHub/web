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
}
