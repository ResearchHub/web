import { createTransformer, BaseTransformed } from './transformer';
import type { AuthorProfile } from './authorProfile';
import { transformAuthorProfile } from './authorProfile';
import { ID } from './root';
import { Hub } from './hub';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isVerified: boolean;
  authorProfile?: AuthorProfile;
  balance: number;
  lockedBalance: number;
  hasCompletedOnboarding?: boolean;
  createdDate?: string;
  moderator: boolean;
  editorOfHubs?: Hub[];
  isModerator?: boolean;
  referralCode?: string;
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
      lockedBalance: 0,
      hasCompletedOnboarding: false,
      createdDate: undefined,
      moderator: false,
      isModerator: false,
    };
  }

  const editorOfHubs = raw.editor_of?.map((group: any) => {
    return {
      id: group?.source?.id,
      name: group?.source?.name,
      slug: group?.source?.slug,
    };
  });

  if (raw.editor_of && typeof raw.author_profile === 'object') {
    raw.author_profile.editor_of = raw.editor_of;
  }

  return {
    id: raw.id || 0,
    email: raw.email || '',
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    fullName: (raw.first_name || '') + (raw.last_name ? ' ' + raw.last_name : '') || 'Unknown User',
    isVerified: raw.is_verified_v2 || false,
    authorProfile: undefined,
    balance: raw.balance || 0,
    lockedBalance: raw.locked_balance || 0,
    hasCompletedOnboarding: raw.has_completed_onboarding || false,
    createdDate: raw.created_date || undefined,
    moderator: raw.moderator || false,
    editorOfHubs: editorOfHubs,
    isModerator: raw.moderator || false,
    referralCode: raw.referral_code || undefined,
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
      balance: 0,
      lockedBalance: 0,
      hasCompletedOnboarding: false,
      moderator: false,
      raw: null,
      isModerator: false,
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
