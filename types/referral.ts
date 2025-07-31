import { createTransformer, BaseTransformed } from './transformer';

export interface ReferralMetrics {
  networkFundingPower: {
    breakdown: {
      networkFunding: number;
    };
  };
  referralActivity: {
    fundersInvited: number;
  };
  yourFundingCredits: {
    available: number;
    used: number;
    totalEarned: number;
  };
}

export interface NetworkDetail {
  signupDate: string;
  totalFunded: number;
  referralBonusEarned: number;
  authorId: number;
  fullName: string;
  profileImage: string;
  referralBonusExpirationDate: string;
  isReferralBonusExpired: boolean;
  username?: string;
}

export interface TransformedNetworkDetailsResult {
  networkDetails: TransformedNetworkDetail[];
  count: number;
  pageSize: number;
}

// New interface for moderator network details result
export interface TransformedModNetworkDetailsResult {
  networkDetails: TransformedModNetworkDetail[];
  count: number;
  pageSize: number;
}

export type TransformedReferralMetrics = ReferralMetrics & BaseTransformed;
export type TransformedNetworkDetail = NetworkDetail & BaseTransformed;

// Extended type for moderator view with referrer information
export interface ModNetworkDetail extends NetworkDetail {
  referrerUser: {
    userId: number;
    fullName: string;
    profileImage: string;
    username: string;
  };
}

export type TransformedModNetworkDetail = ModNetworkDetail & BaseTransformed;

const baseTransformReferralMetrics = (raw: any): ReferralMetrics => {
  if (!raw) {
    return {
      networkFundingPower: {
        breakdown: {
          networkFunding: 0,
        },
      },
      referralActivity: {
        fundersInvited: 0,
      },
      yourFundingCredits: {
        available: 0,
        used: 0,
        totalEarned: 0,
      },
    };
  }

  return {
    networkFundingPower: {
      breakdown: {
        networkFunding: raw.network_funding_power?.breakdown?.network_funding || 0,
      },
    },
    referralActivity: {
      fundersInvited: raw.referral_activity?.funders_invited || 0,
    },
    yourFundingCredits: {
      available: raw.your_funding_credits?.available || 0,
      used: raw.your_funding_credits?.used || 0,
      totalEarned: raw.your_funding_credits?.total_earned || 0,
    },
  };
};

const baseTransformNetworkDetail = (raw: any): NetworkDetail => {
  if (!raw) {
    return {
      signupDate: '',
      totalFunded: 0,
      referralBonusEarned: 0,
      authorId: 0,
      fullName: '',
      profileImage: '',
      referralBonusExpirationDate: '',
      isReferralBonusExpired: false,
    };
  }

  return {
    signupDate: raw.signup_date || '',
    totalFunded: raw.total_funded || 0,
    referralBonusEarned: raw.referral_bonus_earned || 0,
    authorId: raw.author_id || 0,
    fullName: raw.full_name || raw.username || '',
    profileImage: raw.profile_image || '',
    referralBonusExpirationDate: raw.referral_bonus_expiration_date || '',
    isReferralBonusExpired: raw.is_referral_bonus_expired || false,
  };
};

const baseTransformModNetworkDetail = (raw: any): ModNetworkDetail => {
  if (!raw) {
    return {
      signupDate: '',
      totalFunded: 0,
      referralBonusEarned: 0,
      authorId: 0,
      fullName: '',
      profileImage: '',
      referralBonusExpirationDate: '',
      isReferralBonusExpired: false,
      username: '',
      referrerUser: {
        userId: 0,
        fullName: '',
        profileImage: '',
        username: '',
      },
    };
  }

  // Transform from the new API structure
  return {
    signupDate: raw.referred_user?.signup_date || '',
    totalFunded: raw.referred_user?.total_funded || 0,
    referralBonusEarned: raw.referred_user?.referral_bonus_earned || 0,
    authorId: raw.referred_user?.author_id || 0,
    fullName: raw.referred_user?.full_name || raw.referred_user?.username || '',
    profileImage: raw.referred_user?.profile_image || '',
    referralBonusExpirationDate: raw.referred_user?.referral_bonus_expiration_date || '',
    isReferralBonusExpired: raw.referred_user?.is_referral_bonus_expired || false,
    username: raw.referred_user?.username || '',
    referrerUser: {
      userId: raw.referrer?.id || 0,
      fullName: raw.referrer?.full_name || '',
      profileImage: raw.referrer?.profile_image || '',
      username: raw.referrer?.username || '',
    },
  };
};

const baseTransformNetworkDetailsResult = (
  raw: any,
  pageSize: number
): TransformedNetworkDetailsResult => {
  if (!raw) {
    return {
      networkDetails: [],
      count: 0,
      pageSize,
    };
  }

  const networkDetails = (raw.results || [])
    .map((detail: any) => {
      try {
        return baseTransformNetworkDetail(detail);
      } catch (error) {
        console.error('Error transforming network detail:', error, detail);
        return null;
      }
    })
    .filter((detail: any): detail is NetworkDetail => !!detail);

  return {
    networkDetails,
    count: raw.count || 0,
    pageSize,
  };
};

const baseTransformModNetworkDetailsResult = (
  raw: any,
  pageSize: number
): TransformedModNetworkDetailsResult => {
  if (!raw) {
    return {
      networkDetails: [],
      count: 0,
      pageSize,
    };
  }

  const networkDetails = (raw.results || [])
    .map((detail: any) => {
      try {
        return baseTransformModNetworkDetail(detail);
      } catch (error) {
        console.error('Error transforming mod network detail:', error, detail);
        return null;
      }
    })
    .filter((detail: any): detail is ModNetworkDetail => !!detail);

  return {
    networkDetails,
    count: raw.count || 0,
    pageSize,
  };
};

export const transformReferralMetrics = createTransformer<any, ReferralMetrics>(
  baseTransformReferralMetrics
);

export const transformNetworkDetailsPaginated = (pageSize: number) =>
  createTransformer<any, TransformedNetworkDetailsResult>((raw) =>
    baseTransformNetworkDetailsResult(raw, pageSize)
  );

export const transformModNetworkDetailsPaginated = (pageSize: number) =>
  createTransformer<any, TransformedModNetworkDetailsResult>((raw) =>
    baseTransformModNetworkDetailsResult(raw, pageSize)
  );
