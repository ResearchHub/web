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
  // Total RSC balance (available + locked) for funding
  totalRsc?: number;
  hasCompletedOnboarding?: boolean;
  createdDate?: string;
  moderator: boolean;
  editorOfHubs?: Hub[];
  isModerator?: boolean;
  isFunder?: boolean;
  referralCode?: string;
  authProvider?: 'google' | 'credentials';
  isStakingOptedIn?: boolean;
  balanceHistory?: number;
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
      totalRsc: 0,
      hasCompletedOnboarding: false,
      createdDate: undefined,
      moderator: false,
      isModerator: false,
      isFunder: false,
      authProvider: undefined,
      isStakingOptedIn: false,
      balanceHistory: 0,
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
    isVerified: raw.is_verified || false,
    authorProfile: undefined,
    balance: raw.balance || 0,
    lockedBalance: raw.locked_balance || 0,
    totalRsc: (raw.balance || 0) + (raw.locked_balance || 0),
    hasCompletedOnboarding: raw.has_completed_onboarding || false,
    createdDate: raw.created_date || undefined,
    moderator: raw.moderator || false,
    editorOfHubs: editorOfHubs,
    isModerator: raw.moderator || false,
    isFunder: raw.is_funder || false,
    referralCode: raw.referral_code || undefined,
    authProvider: raw.auth_provider
      ? raw.auth_provider === 'google'
        ? 'google'
        : 'credentials'
      : undefined,
    isStakingOptedIn: raw.is_staking_opted_in ?? false,
    balanceHistory: raw.balance_history ?? 0,
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
      totalRsc: 0,
      hasCompletedOnboarding: false,
      moderator: false,
      raw: null,
      isModerator: false,
      isFunder: false,
      authProvider: undefined,
      isStakingOptedIn: false,
      balanceHistory: 0,
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
  isOrcidConnected: boolean;
  orcidVerifiedEduEmail: string | null;
  riskScore: number;
  riskScoreGrade: string;
  verification: {
    createdDate: string;
    externalId: string;
    firstName: string;
    lastName: string;
    verifiedVia: string;
    status: string;
  } | null;
};

export type RiskScoreEvent = {
  id: number;
  eventType: string;
  delta: number;
  sourceType: string | null;
  sourceContentId: number | null;
  createdDate: string;
};

export type RiskScoreEventsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RiskScoreEvent[];
};

export const transformRiskScoreEvent = (raw: any): RiskScoreEvent => ({
  id: raw.id,
  eventType: raw.event_type || '',
  delta: raw.delta ?? 0,
  sourceType: raw.source_type || null,
  sourceContentId: raw.source_content_id ?? null,
  createdDate: raw.created_date || '',
});

export const transformUserDetailsForModerator = (raw: any): UserDetailsForModerator => {
  // Handle null or undefined raw data
  if (!raw) {
    return {
      id: 0,
      isProbableSpammer: false,
      isSuspended: false,
      email: '',
      createdData: '',
      isOrcidConnected: false,
      orcidVerifiedEduEmail: null,
      riskScore: 100,
      riskScoreGrade: 'C-',
      verification: null,
    };
  }

  return {
    id: raw.id || 0,
    isProbableSpammer: raw.probable_spammer || false,
    isSuspended: raw.is_suspended || false,
    email: raw.email || '',
    createdData: raw.created_date || '',
    isOrcidConnected: raw.is_orcid_connected || false,
    orcidVerifiedEduEmail: raw.orcid_verified_edu_email || null,
    riskScore: raw.risk_score ?? 100,
    riskScoreGrade: raw.risk_score_grade || 'C-',
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
