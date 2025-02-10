import type { TransformedUser } from './user';
import type { Organization } from './organization';
import type { NoteApiItem } from './note';
import { transformUser } from './user';
import { transformOrganization } from './organization';
import { createTransformer } from './transformer';

/**
 * Represents the possible permission levels for a note.
 * This is distinct from OrganizationRole, as notes have a three-tier permission system.
 */
export type NoteRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

/**
 * Raw API response structure for a note permission
 * @property organization - The organization that owns the note (matches NoteApiItem's organization structure)
 * @property user - The user who has permission to the note
 * @property access_type - The user's permission level for this note
 * @property created_date - When this permission was granted
 */
export interface NotePermissionApiItem {
  organization: NoteApiItem['organization'];
  user: {
    id: number;
    author_profile: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image: string | null;
    };
    email: string;
  };
  access_type: NoteRole;
  created_date: string;
}

/**
 * Transformed note permission with proper types and camelCase properties
 * @property organization - The transformed organization object
 * @property user - The transformed user object, null if no user
 * @property accessType - The user's permission level for this note
 * @property createdDate - When this permission was granted
 */
export interface NotePermission {
  organization: Organization;
  user: TransformedUser | null;
  accessType: NoteRole;
  createdDate: string;
}

export type TransformedNotePermission = NotePermission;

/**
 * Transforms a raw note permission from the API into a properly typed NotePermission object
 * Handles the transformation of nested organization and user objects
 */
export const transformNotePermission = createTransformer<NotePermissionApiItem, NotePermission>(
  (data) => ({
    organization: transformOrganization(data.organization),
    user: data.user ? transformUser(data.user) : null,
    accessType: data.access_type,
    createdDate: data.created_date,
  })
);
