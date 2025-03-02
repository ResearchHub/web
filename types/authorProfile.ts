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

export const transformAuthorProfile = createTransformer<any, AuthorProfile>((raw) => ({
  id: raw.id,
  fullName: `${raw.first_name} ${raw.last_name}`.trim(),
  profileImage: raw.profile_image || '',
  headline: typeof raw.headline === 'string' ? raw.headline : raw.headline?.title || '',
  profileUrl: `/profile/${raw.id}`,
  user: raw.user ? transformUser(raw.user) : undefined,
}));
