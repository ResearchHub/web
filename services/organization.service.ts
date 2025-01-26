import { ApiClient } from './client';
import { transformOrganization, transformOrganizationUsers } from '@/types/organization';
import type { Organization, OrganizationUsers } from '@/types/organization';
import type { Session } from 'next-auth';

export class OrganizationError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'OrganizationError';
  }
}

export class OrganizationService {
  private static readonly BASE_PATH = '/api/organization';

  /**
   * Fetches organizations for the current user
   * @param session - The user's session
   * @throws {OrganizationError} When the user is not authenticated or the request fails
   */
  static async getUserOrganizations(session: Session | null): Promise<Organization[]> {
    if (!session?.user?.id) {
      throw new OrganizationError('User not authenticated', 'UNAUTHENTICATED');
    }

    try {
      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/${session.user.id}/get_user_organizations/`
      );
      return Array.isArray(response) ? response.map(transformOrganization) : [];
    } catch (error) {
      throw new OrganizationError(
        'Failed to fetch organizations',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Fetches users and invites for a specific organization
   * @param userId - The ID of the current user
   * @param orgId - The ID of the organization
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async getOrganizationUsers(userId: string, orgId: string): Promise<OrganizationUsers> {
    if (!userId || !orgId) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/${orgId}/get_organization_users/`
      );
      return transformOrganizationUsers(response);
    } catch (error) {
      throw new OrganizationError(
        'Failed to fetch organization users',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
