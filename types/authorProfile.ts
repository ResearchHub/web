import { formatTimestamp } from '@/utils/date';
import { ID } from './root';
import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';

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
  degree: {
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
  profileImage: string;
  headline?: string;
  profileUrl: string;
  user?: User;
  description?: string;
  education?: Education[];
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  googleScholar?: string | null;
}

export type TransformedAuthorProfile = AuthorProfile & BaseTransformed;

export const transformAuthorProfile = createTransformer<any, AuthorProfile>((raw) => {
  if (!raw) {
    console.warn('Received null or undefined author profile data');
    return {
      id: 0,
      fullName: 'Unknown Author',
      profileImage: '',
      headline: '',
      profileUrl: '/profile/0',
    };
  }

  return {
    id: raw.id || 0,
    fullName:
      raw.first_name || raw.last_name
        ? `${raw.first_name || ''} ${raw.last_name || ''}`.trim()
        : 'Unknown Author',
    profileImage: raw.profile_image || '',
    headline: typeof raw.headline === 'string' ? raw.headline : raw.headline?.title || '',
    profileUrl: `/profile/${raw.id || 0}`,
    user: raw.user ? transformUser(raw.user) : undefined,
    description: raw.description || undefined,
    education: raw.education || undefined,
    twitter: raw.twitter || undefined,
    facebook: raw.facebook || undefined,
    linkedin: raw.linkedin || undefined,
    googleScholar: raw.google_scholar || undefined,
  };
});
