import type { AuthorProfile } from '@/types/user';

export const ORGANIZATION_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

/**
 * Raw permission data from the API
 */
export interface OrganizationPermission {
  access_type: OrganizationRole;
}

/**
 * Organization data as returned from the API
 */
export interface Organization {
  id: number;
  member_count: number;
  user_permission: OrganizationPermission;
  created_date: string;
  cover_image: string | null;
  description: string;
  name: string;
  slug: string;
}

/**
 * Organization member data from the API
 */
export interface OrganizationMember {
  id: number;
  author_profile: AuthorProfile;
  email: string;
}

/**
 * Organization invite data from the API
 */
export interface OrganizationInvite {
  recipient_email: string;
  created_date: string;
  expiration_date: string;
  accepted: boolean;
}

/**
 * Complete organization users response from the API
 */
export interface OrganizationUsersResponse {
  admins: OrganizationMember[];
  members: OrganizationMember[];
  invited_users: OrganizationInvite[];
  user_count: number;
  note_count: number;
}

export type OrganizationResponse = Organization[];
