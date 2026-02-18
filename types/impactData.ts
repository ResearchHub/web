import { createTransformer } from './transformer';

export interface RawMilestone {
  current?: number;
  target?: number;
}

export interface RawImpactData {
  milestones?: {
    funding_contributed?: RawMilestone;
    researchers_supported?: RawMilestone;
    matched_funding?: RawMilestone;
  };
  funding_over_time?: {
    month: string;
    user_contributions?: number;
    matched_contributions?: number;
  }[];
}

export interface Milestone {
  current: number;
  target: number;
}

export interface Milestones {
  fundingContributed: Milestone;
  researchersSupported: Milestone;
  matchedFunding: Milestone;
}

export interface FundingPoint {
  month: string;
  userContributions: number;
  matchedContributions: number;
}

export interface ImpactData {
  milestones: Milestones;
  fundingOverTime: FundingPoint[];
}

const toMilestone = (raw?: RawMilestone): Milestone => ({
  current: raw?.current ?? 0,
  target: raw?.target ?? 0,
});

export const transformImpactData = createTransformer<RawImpactData, ImpactData>((raw) => ({
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
