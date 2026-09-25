import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';
import { Topic, transformTopic } from './topic';

export interface Education {
  id: number;
  city: string;
  name: string;
  year: {
    label: string;
    value: string;
  };
  major: string;
  state: string;
  degree?: {
    label: string;
    value: string;
  };
  country: string;
  summary: string;
  is_public: boolean;
}

export interface AuthorProfile {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  headline?: string;
  profileUrl: string;
  user?: User;
  description?: string;
  createdDate?: string;
  education?: Education[];
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  googleScholar?: string | null;
  orcidId?: string | null;
  isOrcidConnected?: boolean;
  isClaimed: boolean;
  isVerified: boolean;
  userId?: number;
  editorOfHubs?: Topic[];
  isHubEditor?: boolean;
}

export type TransformedAuthorProfile = AuthorProfile & BaseTransformed;

export function extractHeadline(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'title' in value) {
    const { title } = value as { title: unknown };
    return typeof title === 'string' ? title : '';
  }
  return '';
}

export const transformAuthorProfile = createTransformer<any, AuthorProfile>((raw) => {
  if (!raw) {
    return {
      id: 0,
      fullName: 'Unknown Author',
      firstName: '',
      lastName: '',
      profileImage: '',
      headline: '',
      profileUrl: '/author/0',
      isClaimed: false,
      isVerified: false,
    };
  }

  // Determine if the profile is claimed based on:
  // If a 'user' property exists and is not null
  const isClaimed = !!raw.user && raw.user !== null;

  return {
    id: raw.id || 0,
    fullName:
      raw.first_name || raw.last_name
        ? `${raw.first_name || ''} ${raw.last_name || ''}`.trim()
        : 'Unknown Author',
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    profileImage: raw.profile_image || '',
    headline: extractHeadline(raw.headline),
    profileUrl: `/author/${raw.id || 0}`,
    user: raw.user ? transformUser(raw.user) : undefined,
    description: raw.description || undefined,
    createdDate: raw.created_date || undefined,
    education: raw.education || undefined,
    twitter: raw.twitter || undefined,
    facebook: raw.facebook || undefined,
    linkedin: raw.linkedin || undefined,
    googleScholar: raw.google_scholar || undefined,
    orcidId: raw.orcid_id || undefined,
    isOrcidConnected: raw.is_orcid_connected || false,
    isClaimed: isClaimed,
    userId: raw.user_id || undefined,
    isVerified: raw.is_verified || false,
    isHubEditor: raw.is_hub_editor || false,
    editorOfHubs: (raw.is_hub_editor_of || []).map((topic: any) => transformTopic(topic)),
  };
});
