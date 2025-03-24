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
  balance: number;
}

export type TransformedUser = User & BaseTransformed;

// Create base transformer without circular references
const baseTransformUser = (raw: any): User => {
  // Handle null or undefined raw data
  if (!raw) {
    console.warn('Received null or undefined user data in baseTransformUser');
    return {
      id: 0,
      email: '',
      firstName: '',
      lastName: '',
      fullName: 'Unknown User',
      isVerified: false,
      authorProfile: undefined,
      balance: 0,
    };
  }

  return {
    id: raw.id || 0,
    email: raw.email || '',
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    fullName: (raw.first_name || '') + (raw.last_name ? ' ' + raw.last_name : '') || 'Unknown User',
    isVerified: raw.is_verified || false,
    authorProfile: undefined,
    balance: raw.balance || 0,
  };
};

// Export the wrapped transformer that handles circular references
export const transformUser = (raw: any): TransformedUser => {
  // Handle null or undefined raw data
  if (!raw) {
    console.warn('Received null or undefined user data in transformUser');
    return {
      id: 0,
      email: '',
      firstName: '',
      lastName: '',
      fullName: 'Unknown User',
      isVerified: false,
      authorProfile: undefined,
      balance: 0,
      raw: null,
    };
  }

  const base = createTransformer<any, User>(baseTransformUser)(raw);
  if (raw.author_profile) {
    try {
      base.authorProfile = transformAuthorProfile(raw.author_profile);
    } catch (error) {
      console.error('Error transforming author profile:', error);
    }
  }
  return base;
};
