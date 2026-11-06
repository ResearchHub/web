import { ApiClient } from './client';
import { transformOrganization } from '@/types/organization';
import type { Organization } from '@/types/organization';
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
    if (!session?.userId) {
      throw new OrganizationError('User not authenticated', 'UNAUTHENTICATED');
    }

    try {
      const response = await ApiClient.get<any>(
        `${this.BASE_PATH}/${session.userId}/get_user_organizations/`
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
   * Updates an organization's cover image
   * @param orgId - The ID of the organization
   * @param coverImage - The cover image file to upload
   * @returns The updated organization
   * @throws {OrganizationError} When the request fails
   */
  static async updateOrgCoverImage(
    orgId: string | number,
    coverImage: File | Blob
  ): Promise<Organization> {
    if (!orgId || !coverImage) {
      throw new OrganizationError('Missing required parameters', 'INVALID_PARAMS');
    }

    try {
      const formData = new FormData();
      formData.append('cover_image', coverImage);

      const response = await ApiClient.patch<any>(`${this.BASE_PATH}/${orgId}/`, formData);

      return transformOrganization(response);
    } catch (error) {
      throw new OrganizationError(
        'Failed to update organization cover image',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
}
