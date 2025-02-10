import { useEffect, useState } from 'react';
import { NotePermissionService } from '@/services/notePermission.service';
import type { NotePermission, NoteRole } from '@/types/notePermission';
import { useSession } from 'next-auth/react';

export interface UseNotePermissionsReturn {
  /** All permissions for the note */
  permissions: NotePermission[];
  /** Whether permissions are currently being fetched */
  isLoading: boolean;
  /** Error message if the fetch failed, null otherwise */
  error: string | null;
  /** Function to check if the current user has a specific permission level */
  hasPermission: (requiredRole: NoteRole) => boolean;
  /** The current user's role for this note */
  currentRole: NoteRole;
}

const ROLE_HIERARCHY: Record<NoteRole, number> = {
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

/**
 * Custom hook to fetch and manage note permissions
 * @param noteId - The ID of the note to fetch permissions for
 * @returns UseNotePermissionsReturn object containing permissions data and utility functions
 */
export function useNotePermissions(noteId: string | null): UseNotePermissionsReturn {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<NotePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<NoteRole>('VIEWER');

  useEffect(() => {
    let isMounted = true;

    const fetchPermissions = async () => {
      if (!noteId || !session?.user?.id) {
        if (isMounted) {
          setPermissions([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const notePermissions = await NotePermissionService.getNotePermissions(noteId);
        if (isMounted) {
          const userPermission = notePermissions.find(
            (permission) => permission.user?.id === Number(session.user.id)
          );
          setUserRole(userPermission?.accessType || 'VIEWER');
          setPermissions(notePermissions);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch note permissions');
          setPermissions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPermissions();
    return () => {
      isMounted = false;
    };
  }, [noteId, session?.user?.id]);

  /**
   * Check if the current user has the required permission level or higher
   * @param requiredRole - The minimum role level required
   * @returns boolean indicating if the user has sufficient permissions
   */
  const hasPermission = (requiredRole: NoteRole): boolean => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    currentRole: userRole,
  };
}
