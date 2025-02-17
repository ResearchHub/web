import { createTransformer, BaseTransformed } from './transformer';
import type { AuthorProfile } from './authorProfile';
import { transformAuthorProfile } from './authorProfile';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isVerified: boolean;
  authorProfile?: AuthorProfile;
}

export type TransformedUser = User & BaseTransformed;

// Create base transformer without circular references
const baseTransformUser = (raw: any): User => ({
  id: raw.id,
  email: raw.email,
  firstName: raw.first_name,
  lastName: raw.last_name,
  fullName: raw.first_name + (raw.last_name ? ' ' + raw.last_name : ''),
  isVerified: raw.is_verified || false,
  authorProfile: undefined,
});

// Export the wrapped transformer that handles circular references
export const transformUser = (raw: any): TransformedUser => {
  const base = createTransformer<any, User>(baseTransformUser)(raw);
  if (raw.author_profile) {
    base.authorProfile = transformAuthorProfile(raw.author_profile);
  }
  return base;
};

const requiredUserProperties: Record<keyof User, (value: any) => boolean> = {
  id: (v) => typeof v === 'number',
  email: (v) => typeof v === 'string',
  firstName: (v) => typeof v === 'string',
  lastName: (v) => typeof v === 'string',
  fullName: (v) => typeof v === 'string',
  isVerified: (v) => typeof v === 'boolean',
  authorProfile: (v) => v === undefined || typeof v === 'object',
};

export function isUser(user: any): user is User {
  if (typeof user !== 'object' || user === null) {
    return false;
  }

  return Object.entries(requiredUserProperties).every(([key, validator]) => {
    return validator(user[key]);
  });
}
