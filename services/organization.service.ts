import { ApiClient } from './client';
import { transformOrganization } from '@/types/organization';
import type { Organization } from '@/types/organization';
import type { Session } from 'next-auth';

class OrganizationError extends Error {
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
}
