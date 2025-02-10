import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { OrganizationService } from '@/services/organization.service';
import type { OrganizationUsers } from '@/types/organization';
import type { OrganizationRole } from '@/types/organization';

export interface UseOrganizationPermissionsReturn {
  /** All users in the organization */
  organizationUsers: OrganizationUsers | null;
  /** Whether permissions are currently being fetched */
  isLoading: boolean;
  /** Error message if the fetch failed, null otherwise */
  error: string | null;
  /** Function to check if the current user has admin permissions */
  isAdmin: () => boolean;
  /** The current user's role in this organization */
  currentRole: OrganizationRole;
}

/**
 * Custom hook to fetch and manage organization permissions
 * @param orgId - The ID of the organization to fetch permissions for
 * @returns UseOrganizationPermissionsReturn object containing permissions data and utility functions
 */
export function useOrganizationPermissions(orgId: string | null): UseOrganizationPermissionsReturn {
  const { data: session } = useSession();
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<OrganizationRole>('MEMBER');

  useEffect(() => {
    let isMounted = true;

    const fetchOrganizationUsers = async () => {
      if (!orgId || !session?.user?.id) {
        if (isMounted) {
          setOrganizationUsers(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const users = await OrganizationService.getOrganizationUsers(
          session.user.id.toString(),
          orgId
        );

        if (!isMounted) return;

        // Determine if current user is an admin
        const isUserAdmin = users.admins.some((admin) => admin.id === Number(session.user.id));
        setCurrentRole(isUserAdmin ? 'ADMIN' : 'MEMBER');
        setOrganizationUsers(users);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch organization users');
        setOrganizationUsers(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrganizationUsers();
    return () => {
      isMounted = false;
    };
  }, [orgId, session?.user?.id]);

  /**
   * Check if the current user is an admin
   * @returns boolean indicating if the user is an admin
   */
  const isAdmin = (): boolean => {
    return currentRole === 'ADMIN';
  };

  return {
    organizationUsers,
    isLoading,
    error,
    isAdmin,
    currentRole,
  };
}
