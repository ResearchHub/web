import { createTransformer } from './transformer';

export interface RawFundingMilestone {
  current?: number;
  target?: number;
}

export interface RawFundingImpactData {
  milestones?: {
    funding_contributed?: RawFundingMilestone;
    researchers_supported?: RawFundingMilestone;
    matched_funding?: RawFundingMilestone;
  };
  funding_over_time?: {
    month: string;
    user_contributions?: number;
    matched_contributions?: number;
  }[];
}

export interface FundingMilestone {
  current: number;
  target: number;
}

export interface FundingMilestones {
  fundingContributed: FundingMilestone;
  researchersSupported: FundingMilestone;
  matchedFunding: FundingMilestone;
}

export interface FundingPoint {
  month: string;
  userContributions: number;
  matchedContributions: number;
}

export interface FundingImpactData {
  milestones: FundingMilestones;
  fundingOverTime: FundingPoint[];
}

const toMilestone = (raw?: RawFundingMilestone): FundingMilestone => ({
  current: raw?.current ?? 0,
  target: raw?.target ?? 0,
});

export const transformFundingImpactData = createTransformer<
  RawFundingImpactData,
  FundingImpactData
>((raw) => ({
  milestones: {
    fundingContributed: toMilestone(raw.milestones?.funding_contributed),
    researchersSupported: toMilestone(raw.milestones?.researchers_supported),
    matchedFunding: toMilestone(raw.milestones?.matched_funding),
  },
  fundingOverTime: (raw.funding_over_time ?? []).map((point) => ({
    month: point.month,
    userContributions: point.user_contributions ?? 0,
    matchedContributions: point.matched_contributions ?? 0,
  })),
}));
