import { createTransformer, BaseTransformed } from './transformer';

// Client-side types with camelCase
export interface ReferralMetrics {
  networkFundingPower: {
    totalDeployed: number;
    totalPotentialImpact: number;
    breakdown: {
      directFunding: number;
      networkFunding: number;
      creditsUsed: number;
      availableCredits: number;
      networkAvailableCredits: number;
    };
  };
  referralActivity: {
    fundersInvited: number;
    activeFunders: number;
  };
  yourFundingCredits: {
    available: number;
    totalEarned: number;
    used: number;
  };
  networkEarnedCredits: {
    total: number;
    byReferredUsers: number;
  };
}

export interface NetworkDetail {
  userId: number;
  username: string;
  signupDate: string;
  totalFunded: number;
  referralBonusEarned: number;
  isActiveFunder: boolean;
}

export type TransformedReferralMetrics = ReferralMetrics & BaseTransformed;
export type TransformedNetworkDetail = NetworkDetail & BaseTransformed;

// Transformer for ReferralMetrics
const baseTransformReferralMetrics = (raw: any): ReferralMetrics => {
  if (!raw) {
    return {
      networkFundingPower: {
        totalDeployed: 0,
        totalPotentialImpact: 0,
        breakdown: {
          directFunding: 0,
          networkFunding: 0,
          creditsUsed: 0,
          availableCredits: 0,
          networkAvailableCredits: 0,
        },
      },
      referralActivity: {
        fundersInvited: 0,
        activeFunders: 0,
      },
      yourFundingCredits: {
        available: 0,
        totalEarned: 0,
        used: 0,
      },
      networkEarnedCredits: {
        total: 0,
        byReferredUsers: 0,
      },
    };
  }

  return {
    networkFundingPower: {
      totalDeployed: raw.network_funding_power?.total_deployed || 0,
      totalPotentialImpact: raw.network_funding_power?.total_potential_impact || 0,
      breakdown: {
        directFunding: raw.network_funding_power?.breakdown?.direct_funding || 0,
        networkFunding: raw.network_funding_power?.breakdown?.network_funding || 0,
        creditsUsed: raw.network_funding_power?.breakdown?.credits_used || 0,
        availableCredits: raw.network_funding_power?.breakdown?.available_credits || 0,
        networkAvailableCredits:
          raw.network_funding_power?.breakdown?.network_available_credits || 0,
      },
    },
    referralActivity: {
      fundersInvited: raw.referral_activity?.funders_invited || 0,
      activeFunders: raw.referral_activity?.active_funders || 0,
    },
    yourFundingCredits: {
      available: raw.your_funding_credits?.available || 0,
      totalEarned: raw.your_funding_credits?.total_earned || 0,
      used: raw.your_funding_credits?.used || 0,
    },
    networkEarnedCredits: {
      total: raw.network_earned_credits?.total || 0,
      byReferredUsers: raw.network_earned_credits?.by_referred_users || 0,
    },
  };
};

// Transformer for NetworkDetail
const baseTransformNetworkDetail = (raw: any): NetworkDetail => {
  if (!raw) {
    return {
      userId: 0,
      username: '',
      signupDate: '',
      totalFunded: 0,
      referralBonusEarned: 0,
      isActiveFunder: false,
    };
  }

  return {
    userId: raw.user_id || 0,
    username: raw.username || '',
    signupDate: raw.signup_date || '',
    totalFunded: raw.total_funded || 0,
    referralBonusEarned: raw.referral_bonus_earned || 0,
    isActiveFunder: raw.is_active_funder || false,
  };
};

// Export the wrapped transformers
export const transformReferralMetrics = createTransformer<any, ReferralMetrics>(
  baseTransformReferralMetrics
);
export const transformNetworkDetail = createTransformer<any, NetworkDetail>(
  baseTransformNetworkDetail
);
