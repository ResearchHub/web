import type { OrganizationUsersResponse } from '@/services/types/organization.dto';

export interface FormattedOrganizationUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}

export interface FormattedOrganizationInvite {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending';
  expirationDate: string;
}

export interface FormattedOrganizationUsers {
  users: FormattedOrganizationUser[];
  invites: FormattedOrganizationInvite[];
}

export function formatOrganizationUsers(
  response: OrganizationUsersResponse
): FormattedOrganizationUsers {
  const users = [
    // Map admins with admin role
    ...response.admins.map((admin) => ({
      id: admin.id.toString(),
      name: `${admin.author_profile.first_name} ${admin.author_profile.last_name}`,
      email: admin.email,
      role: 'admin' as const,
      avatarUrl: admin.author_profile.profile_image || undefined,
    })),
    // Map regular members with viewer role
    ...response.members.map((member) => ({
      id: member.id.toString(),
      name: `${member.author_profile.first_name} ${member.author_profile.last_name}`,
      email: member.email,
      role: 'viewer' as const,
      avatarUrl: member.author_profile.profile_image || undefined,
    })),
  ];

  const invites = response.invited_users.map((invite) => ({
    id: `invite-${invite.recipient_email}`,
    name: invite.recipient_email,
    email: invite.recipient_email,
    role: 'viewer' as const,
    status: 'pending' as const,
    expirationDate: invite.expiration_date,
  }));

  return { users, invites };
}
