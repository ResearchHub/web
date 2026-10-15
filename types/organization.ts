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
