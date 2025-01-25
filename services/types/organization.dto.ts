export interface OrganizationPermission {
  access_type: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

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

export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}

export interface OrganizationInvite {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending';
  expirationDate: string;
}

export type OrganizationResponse = Organization[];

export interface OrganizationUsersResponse {
  admins: Array<{
    id: number;
    author_profile: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image: string | null;
    };
    email: string;
  }>;
  members: Array<{
    id: number;
    author_profile: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image: string | null;
    };
    email: string;
  }>;
  invited_users: Array<{
    recipient_email: string;
    created_date: string;
    expiration_date: string;
    accepted: boolean;
  }>;
  user_count: number;
  note_count: number;
}
