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
  };
}

export interface NetworkDetail {
  signupDate: string;
  totalFunded: number;
  referralBonusEarned: number;
  authorId: number;
  fullName: string;
  profileImage: string;
}

export interface TransformedNetworkDetailsResult {
  networkDetails: TransformedNetworkDetail[];
  count: number;
  pageSize: number;
}

export type TransformedReferralMetrics = ReferralMetrics & BaseTransformed;
export type TransformedNetworkDetail = NetworkDetail & BaseTransformed;

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
    };
  }

  return {
    signupDate: raw.signup_date || '',
    totalFunded: raw.total_funded || 0,
    referralBonusEarned: raw.referral_bonus_earned || 0,
    authorId: raw.author_id || 0,
    fullName: raw.full_name || raw.username || '',
    profileImage: raw.profile_image || '',
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

export const transformReferralMetrics = createTransformer<any, ReferralMetrics>(
  baseTransformReferralMetrics
);

export const transformNetworkDetailsPaginated = (pageSize: number) =>
  createTransformer<any, TransformedNetworkDetailsResult>((raw) =>
    baseTransformNetworkDetailsResult(raw, pageSize)
  );
