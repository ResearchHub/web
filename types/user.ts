import { createTransformer, BaseTransformed } from './transformer';
import type { AuthorProfile } from './authorProfile';
import { transformAuthorProfile } from './authorProfile';
import { ID } from './root';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isVerified: boolean;
  authorProfile?: AuthorProfile;
  balance: number;
  hasCompletedOnboarding?: boolean;
  createdDate?: string;
  moderator: boolean;
}

export type TransformedUser = User & BaseTransformed;

// Create base transformer without circular references
const baseTransformUser = (raw: any): User => {
  // Handle null or undefined raw data
  if (!raw) {
    return {
      id: 0,
      email: '',
      firstName: '',
      lastName: '',
      fullName: 'Unknown User',
      isVerified: false,
      authorProfile: undefined,
      balance: 0,
      hasCompletedOnboarding: false,
      createdDate: undefined,
      moderator: false,
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
    hasCompletedOnboarding: raw.has_completed_onboarding || false,
    createdDate: raw.created_date || undefined,
    moderator: raw.moderator || false,
  };
};

// Export the wrapped transformer that handles circular references
export const transformUser = (raw: any): TransformedUser => {
  // Handle null or undefined raw data
  if (!raw) {
    return {
      id: 0,
      email: '',
      firstName: '',
      lastName: '',
      fullName: 'Unknown User',
      isVerified: false,
      authorProfile: undefined,
      hasCompletedOnboarding: false,
      balance: 0,
      moderator: false,
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

export type UserDetailsForModerator = {
  id: ID;
  isProbableSpammer: boolean;
  isSuspended: boolean;
  email: string;
  createdData: string;
  riskScore: number;
  verification: {
    createdDate: string;
    externalId: string;
    firstName: string;
    lastName: string;
    verifiedVia: string;
    status: string;
  } | null;
};

// Add this after the existing UserDetailsForModerator type definition
export const transformUserDetailsForModerator = (raw: any): UserDetailsForModerator => {
  // Handle null or undefined raw data
  if (!raw) {
    return {
      id: 0,
      isProbableSpammer: false,
      isSuspended: false,
      email: '',
      createdData: '',
      riskScore: 0,
      verification: null,
    };
  }

  return {
    id: raw.id || 0,
    isProbableSpammer: raw.probable_spammer || false,
    isSuspended: raw.is_suspended || false,
    email: raw.email || '',
    createdData: raw.created_date || '',
    riskScore: raw.risk_score || 0,
    verification: raw.verification
      ? {
          createdDate: raw.verification.created_date || '',
          externalId: raw.verification.external_id || '',
          firstName: raw.verification.first_name || '',
          lastName: raw.verification.last_name || '',
          verifiedVia: raw.verification.verified_by || '',
          status: raw.verification.status || '',
        }
      : null,
  };
};
