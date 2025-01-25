import { ApiClient } from './client';
import type { OrganizationResponse, OrganizationUsersResponse } from './types/organization.dto';
import { getSession } from 'next-auth/react';

export class OrganizationService {
  private static readonly BASE_PATH = '/api/organization';

  /**
   * Fetches organizations for the current user
   */
  static async getUserOrganizations(): Promise<OrganizationResponse> {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('No user ID found in session');
    }

    return ApiClient.get<OrganizationResponse>(
      `${this.BASE_PATH}/${session.user.id}/get_user_organizations/`
    );
  }

  /**
   * Fetches users and invites for a specific organization
   */
  static async getOrganizationUsers(
    userId: string,
    orgId: string
  ): Promise<OrganizationUsersResponse> {
    return ApiClient.get<OrganizationUsersResponse>(
      `${this.BASE_PATH}/${orgId}/get_organization_users/`
    );
  }
}
