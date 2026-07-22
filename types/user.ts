import { createTransformer, BaseTransformed } from './transformer';
import type { AuthorProfile } from './authorProfile';
import { transformAuthorProfile } from './authorProfile';
import { ID } from './root';
import { Hub } from './hub';

export interface UserBalances {
  rsc: number;
  /** Locked RSC; the sum of rscPromotional and rscFundingCredits. */
  rscLocked: number;
  /** Subset of rscLocked that earns yield (not withdrawable). */
  rscPromotional: number;
  /** Subset of rscLocked that does not earn yield. */
  rscFundingCredits: number;
  /** rsc + rscLocked. */
  totalRsc: number;
  totalUsdCents: number;
}

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
  promotionalBalance?: number;
  fundingCredits?: number;
  balances?: UserBalances;
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

  // Prefer the consolidated `balances` object; fall back to the legacy
  // top-level fields for responses that don't include it yet.
  const balances: UserBalances | undefined = raw.balances
    ? {
        rsc: raw.balances.rsc ?? 0,
        rscLocked: raw.balances.rsc_locked ?? 0,
        rscPromotional: raw.balances.rsc_promotional ?? 0,
        // Locked = promotional + funding credits, so derive the credits
        // portion when a response predates the dedicated field.
        rscFundingCredits:
          raw.balances.rsc_funding_credits ??
          Math.max(0, (raw.balances.rsc_locked ?? 0) - (raw.balances.rsc_promotional ?? 0)),
        totalRsc: raw.balances.total_rsc ?? 0,
        totalUsdCents: raw.balances.total_usd_cents ?? 0,
      }
    : undefined;

  return {
    id: raw.id || 0,
    email: raw.email || '',
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    fullName: (raw.first_name || '') + (raw.last_name ? ' ' + raw.last_name : '') || 'Unknown User',
    isVerified: raw.is_verified || false,
    authorProfile: undefined,
    balance: balances?.rsc ?? raw.balance ?? 0,
    lockedBalance: balances?.rscLocked ?? raw.locked_balance ?? 0,
    promotionalBalance: balances?.rscPromotional ?? raw.promotional_balance ?? 0,
    // Locked = promotional + funding credits, so derive the credits portion
    // from the legacy top-level fields when `balances` is absent.
    fundingCredits:
      balances?.rscFundingCredits ??
      Math.max(0, (raw.locked_balance || 0) - (raw.promotional_balance || 0)),
    balances,
    totalRsc: balances?.totalRsc ?? (raw.balance || 0) + (raw.locked_balance || 0),
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
  verification: {
    createdDate: string;
    externalId: string;
    firstName: string;
    lastName: string;
    verifiedVia: string;
    status: string;
  } | null;
};

export type DocumentType =
  | 'PAPER'
  | 'DISCUSSION'
  | 'PREREGISTRATION'
  | 'GRANT'
  | 'QUESTION'
  | 'NOTE'
  | 'BOUNTY'
  | 'POSTS';

export type CommentType =
  | 'GENERIC_COMMENT'
  | 'PEER_REVIEW'
  | 'REVIEW'
  | 'ANSWER'
  | 'SUMMARY'
  | 'AUTHOR_UPDATE'
  | 'REPLICABILITY_COMMENT'
  | 'INNER_CONTENT_COMMENT';

export type SourceDetail = {
  title: string;
  text: string;
  url: string | null;
  commentType: CommentType | null;
  documentType: DocumentType | null;
};

export type RiskScoreEvent = {
  id: number;
  eventType: string;
  delta: number;
  sourceType: string | null;
  sourceContentId: number | null;
  sourceDetail: SourceDetail | null;
  actionDate: string;
};

export type Insight = {
  eventType: string;
  count: number;
  totalDelta: number;
  maxDelta: number;
  minDelta: number;
};

export type RiskScoreEventsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RiskScoreEvent[];
  insights: Insight[];
};

export interface RiskScoreEventsFilters {
  page?: number;
  pageSize?: number;
  eventType?: string;
  deltaPositive?: boolean;
  actionDateAfter?: string;
  actionDateBefore?: string;
}

export const transformRiskScoreEvent = (raw: any): RiskScoreEvent => ({
  id: raw.id,
  eventType: raw.event_type || '',
  delta: raw.delta ?? 0,
  sourceType: raw.source_type || null,
  sourceContentId: raw.source_content_id ?? null,
  sourceDetail: raw.source_detail
    ? {
        title: raw.source_detail.title ?? '',
        text: raw.source_detail.text ?? '',
        url: raw.source_detail.url ?? null,
        commentType: raw.source_detail.comment_type ?? null,
        documentType: raw.source_detail.document_type ?? null,
      }
    : null,
  actionDate: raw.action_date || '',
});

export const transformInsight = (raw: any): Insight => ({
  eventType: raw.event_type || '',
  count: raw.count ?? 0,
  totalDelta: raw.total_delta ?? 0,
  maxDelta: raw.max_delta ?? 0,
  minDelta: raw.min_delta ?? 0,
});

export interface EarningAmount {
  rsc: number;
  rscUsdSnapshot: number;
  usd: number;
}

export type EarningSource =
  | 'FUNDRAISE_PAYOUT'
  | 'USD_FUNDRAISE_PAYOUT'
  | 'TIP_REVIEW'
  | 'BOUNTY_PAYOUT'
  | (string & {});

export interface EarningOverview {
  totalEarned: EarningAmount;
  bySource: Partial<Record<EarningSource, EarningAmount>>;
}

const transformEarningAmount = (raw: any): EarningAmount => ({
  rsc: raw?.rsc ?? 0,
  rscUsdSnapshot: raw?.rsc_usd_snapshot ?? 0,
  usd: raw?.usd ?? 0,
});

export const transformEarningOverview = (raw: any): EarningOverview => ({
  totalEarned: transformEarningAmount(raw?.total_earned),
  bySource: Object.fromEntries(
    Object.entries(raw?.by_source ?? {}).map(([key, value]) => [key, transformEarningAmount(value)])
  ),
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
      riskScore: -1,
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
    riskScore: raw.risk_score ?? -1,
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
