export type OrganizationRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

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

export interface OrganizationMember {
  id: string;
  authorId: number;
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

function transformOrganizationUser(raw: any, role: OrganizationRole): OrganizationMember {
  return {
    id: raw.id.toString(),
    authorId: raw.author_profile?.id,
    name: `${raw.author_profile?.first_name} ${raw.author_profile?.last_name}`.trim(),
    email: raw.email,
    role,
    avatarUrl: raw.author_profile?.profile_image || undefined,
  };
}

export function transformOrganizationUsers(response: any): OrganizationUsers {
  const users = [
    // Map admins with admin role
    ...(response.admins || []).map((admin: any) => transformOrganizationUser(admin, 'ADMIN')),
    // Map regular members with viewer role
    ...(response.members || []).map((member: any) => transformOrganizationUser(member, 'VIEWER')),
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
    userPermission: data.user_permission
      ? {
          accessType: data.user_permission.access_type,
        }
      : undefined,
    createdDate: data.created_date,
    coverImage: data.cover_image,
    description: data.description,
    name: data.name,
    slug: data.slug,
  };
}
