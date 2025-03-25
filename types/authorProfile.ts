import { formatTimestamp } from '@/utils/date';
import { ID } from './root';
import { createTransformer, BaseTransformed } from './transformer';
import { User, transformUser } from './user';

export interface AuthorProfile {
  id: number;
  fullName: string;
  profileImage: string;
  headline?: string;
  profileUrl: string;
  user?: User;
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
  };
});
