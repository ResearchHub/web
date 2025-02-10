import type { TransformedUser } from './user';
import { transformUser } from './user';
import { createTransformer } from './transformer';

export type OrganizationRole = 'ADMIN' | 'MEMBER';

export interface Organization {
  id: number;
  memberCount?: number;
  userPermission?: {
    accessType: OrganizationRole;
  };
  createdDate?: string;
  coverImage: string | null;
  description?: string;
  name: string;
  slug: string;
}

export interface OrganizationUserApiItem {
  id: number;
  author_profile: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
  email: string;
}

export interface OrganizationUsersApiResponse {
  admins: OrganizationUserApiItem[];
  invited_users: OrganizationUserApiItem[];
  user_count: number;
  note_count: number;
}

export interface OrganizationUsers {
  admins: TransformedUser[];
  invitedUsers: TransformedUser[];
  userCount: number;
  noteCount: number;
}

export const transformOrganizationUsers = createTransformer<
  OrganizationUsersApiResponse,
  OrganizationUsers
>((data: OrganizationUsersApiResponse) => ({
  admins: (data.admins || []).map(transformUser),
  invitedUsers: (data.invited_users || []).map(transformUser),
  userCount: data.user_count,
  noteCount: data.note_count,
}));

export function transformOrganization(data: any): Organization {
  return {
    id: data.id,
    memberCount: data.member_count,
    userPermission: data.user_permission
      ? {
          accessType: data.user_permission.access_type as OrganizationRole,
        }
      : undefined,
    createdDate: data.created_date,
    coverImage: data.cover_image,
    description: data.description,
    name: data.name,
    slug: data.slug,
  };
}
