import type { AuthorProfile } from './user';

export type OrganizationRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Organization {
  id: number;
  memberCount: number;
  userPermission: {
    accessType: OrganizationRole;
  };
  createdDate: string;
  coverImage: string | null;
  description: string;
  name: string;
  slug: string;
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  avatarUrl?: string;
}

export interface OrganizationInvite {
  id: string;
  name: string;
  email: string;
  role: OrganizationRole;
  status: 'pending';
  expirationDate: string;
}

export interface OrganizationUsers {
  users: OrganizationMember[];
  invites: OrganizationInvite[];
}

export function transformOrganizationUsers(response: any): OrganizationUsers {
  const users = [
    // Map admins with admin role
    ...(response.admins || []).map((admin: any) => ({
      id: admin.id.toString(),
      name: admin.author_profile.fullName,
      email: admin.email,
      role: 'ADMIN' as const,
      avatarUrl: admin.author_profile.profileImage || undefined,
    })),
    // Map regular members with viewer role
    ...(response.members || []).map((member: any) => ({
      id: member.id.toString(),
      name: member.author_profile.fullName,
      email: member.email,
      role: 'VIEWER' as const,
      avatarUrl: member.author_profile.profileImage || undefined,
    })),
  ];

  const invites = (response.invited_users || []).map((invite: any) => ({
    id: `invite-${invite.recipient_email}`,
    name: invite.recipient_email,
    email: invite.recipient_email,
    role: 'VIEWER' as const,
    status: 'pending' as const,
    expirationDate: invite.expiration_date,
  }));

  return { users, invites };
}

export function transformOrganization(data: any): Organization {
  return {
    id: data.id,
    memberCount: data.member_count,
    userPermission: {
      accessType: data.user_permission.access_type,
    },
    createdDate: data.created_date,
    coverImage: data.cover_image,
    description: data.description,
    name: data.name,
    slug: data.slug,
  };
}
