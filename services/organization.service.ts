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
   * @param orgId - The ID of the organization
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async getOrganizationUsers(orgId: string): Promise<OrganizationUsers> {
    if (!orgId) {
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

  /**
   * Updates organization details
   * @param orgId - The ID of the organization to update
   * @param name - The new name for the organization
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async updateOrgDetails(orgId: string | number, name: string): Promise<Organization> {
    if (!orgId || !name) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.patch<any>(`${this.BASE_PATH}/${orgId}/`, { name });
      return transformOrganization(response);
    } catch (error) {
      throw new OrganizationError(
        'Failed to update organization details',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Removes a user from an organization
   * @param orgId - The ID of the organization
   * @param userId - The ID of the user to remove
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async removeUserFromOrg(
    orgId: string | number,
    userId: string | number
  ): Promise<boolean> {
    if (!orgId || !userId) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.delete<any>(`${this.BASE_PATH}/${orgId}/remove_user/`, { user: userId });
      return true;
    } catch (error) {
      throw new OrganizationError(
        'Failed to remove user from organization',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Removes an invited user from an organization
   * @param orgId - The ID of the organization
   * @param email - The email of the invited user to remove
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async removeInvitedUserFromOrg(orgId: string | number, email: string): Promise<boolean> {
    if (!orgId || !email) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.patch<any>(`${this.BASE_PATH}/${orgId}/remove_invited_user/`, { email });
      return true;
    } catch (error) {
      throw new OrganizationError(
        'Failed to remove invited user from organization',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Invites a user to an organization
   * @param orgId - The ID of the organization
   * @param email - The email of the user to invite
   * @param expire - The expiration time in minutes (default: 10080 = 1 week)
   * @param accessType - The access type for the invited user (default: "MEMBER")
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async inviteUserToOrg(
    orgId: string | number,
    email: string,
    expire: number = 10080,
    accessType: string = 'MEMBER'
  ): Promise<boolean> {
    if (!orgId || !email) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post<any>(`${this.BASE_PATH}/${orgId}/invite_user/`, {
        email,
        expire,
        access_type: accessType,
      });
      return true;
    } catch (error) {
      throw new OrganizationError(
        'Failed to invite user to organization',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Accepts an organization invitation
   * @param token - The invitation token
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async acceptOrgInvite(token: string): Promise<boolean> {
    if (!token) {
      throw new OrganizationError('Missing required token', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.post<any>(`/api/invite/organization/${token}/accept_invite/`, { token });
      return true;
    } catch (error) {
      throw new OrganizationError(
        'Failed to accept organization invitation',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Fetches organization details using an invitation token
   * @param token - The invitation token
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async fetchOrgByInviteToken(token: string): Promise<Organization> {
    if (!token) {
      throw new OrganizationError('Missing required token', 'INVALID_PARAMS');
    }

    try {
      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/${token}/get_organization_by_key/`
      );
      return transformOrganization(response);
    } catch (error) {
      throw new OrganizationError(
        'Failed to fetch organization by invite token',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Updates a user's permissions in an organization
   * @param orgId - The ID of the organization
   * @param userId - The ID of the user whose permissions are being updated
   * @param accessType - The new access type for the user ("ADMIN", "EDITOR", or "VIEWER")
   * @throws {OrganizationError} When the request fails or parameters are invalid
   */
  static async updateOrgUserPermissions(
    orgId: string | number,
    userId: string | number,
    accessType: 'ADMIN' | 'EDITOR' | 'VIEWER'
  ): Promise<boolean> {
    if (!orgId || !userId || !accessType) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      await ApiClient.patch<any>(`${this.BASE_PATH}/${orgId}/update_user_permission/`, {
        access_type: accessType,
        user: userId,
      });
      return true;
    } catch (error) {
      throw new OrganizationError(
        'Failed to update user permissions',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
