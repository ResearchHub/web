import { createTransformer } from './transformer';

// Raw API response types (snake_case)
export interface RawMilestone {
  current?: number;
  target?: number;
}

export interface RawMilestones {
  funding_contributed?: RawMilestone;
  researchers_supported?: RawMilestone;
  matched_funding?: RawMilestone;
}

export interface RawFundingPoint {
  month: string;
  user_contributions?: number;
  matched_contributions?: number;
}

export interface RawTopicAmount {
  name: string;
  amount_usd?: number;
}

export interface RawUpdateBucket {
  bucket: string;
  count?: number;
}

export interface RawInstitution {
  name: string;
  ein?: string;
  amount_usd?: number;
  project_count?: number;
}

export interface RawImpactData {
  milestones?: RawMilestones;
  funding_over_time?: RawFundingPoint[];
  topic_breakdown?: RawTopicAmount[];
  update_frequency?: RawUpdateBucket[];
  institutions_supported?: RawInstitution[];
}

// Transformed types (camelCase)
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

export interface TopicAmount {
  name: string;
  amountUsd: number;
}

export interface UpdateBucket {
  bucket: string;
  count: number;
}

export interface Institution {
  name: string;
  ein: string;
  amountUsd: number;
  projectCount: number;
}

export interface ImpactData {
  milestones: Milestones;
  fundingOverTime: FundingPoint[];
  topicBreakdown: TopicAmount[];
  updateFrequency: UpdateBucket[];
  institutionsSupported: Institution[];
}

export const transformImpactData = createTransformer<RawImpactData, ImpactData>((raw) => {
  const ms = raw.milestones ?? {};

  return {
    milestones: {
      fundingContributed: {
        current: ms.funding_contributed?.current ?? 0,
        target: ms.funding_contributed?.target ?? 0,
      },
      researchersSupported: {
        current: ms.researchers_supported?.current ?? 0,
        target: ms.researchers_supported?.target ?? 0,
      },
      matchedFunding: {
        current: ms.matched_funding?.current ?? 0,
        target: ms.matched_funding?.target ?? 0,
      },
    },
    fundingOverTime: (raw.funding_over_time ?? []).map((p) => ({
      month: p.month,
      userContributions: p.user_contributions ?? 0,
      matchedContributions: p.matched_contributions ?? 0,
    })),
    topicBreakdown: (raw.topic_breakdown ?? []).map((t) => ({
      name: t.name,
      amountUsd: t.amount_usd ?? 0,
    })),
    updateFrequency: (raw.update_frequency ?? []).map((u) => ({
      bucket: u.bucket,
      count: u.count ?? 0,
    })),
    institutionsSupported: (raw.institutions_supported ?? []).map((i) => ({
      name: i.name,
      ein: i.ein ?? '',
      amountUsd: i.amount_usd ?? 0,
      projectCount: i.project_count ?? 0,
    })),
  };
});
