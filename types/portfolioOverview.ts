import { createTransformer } from './transformer';

// Raw API response types (snake_case)
export interface RawActiveGrants {
  active?: number;
  total?: number;
}

export interface RawTotalApplicants {
  total?: number;
  active?: number;
  previous?: number;
}

export interface RawPortfolioOverview {
  total_distributed_usd?: number;
  active_grants?: RawActiveGrants;
  total_applicants?: RawTotalApplicants | number;
  matched_funding_usd?: number;
  recent_updates?: number;
  proposals_funded?: number;
}

// Transformed types (camelCase)
export interface ActiveRfps {
  active: number;
  total: number;
}

export interface TotalApplicants {
  total: number;
  active: number;
  previous: number;
}

export interface PortfolioOverview {
  totalDistributedUsd: number;
  activeRfps: ActiveRfps;
  totalApplicants: TotalApplicants;
  matchedFundingUsd: number;
  recentUpdates: number;
  proposalsFunded: number;
}

export const transformPortfolioOverview = createTransformer<
  RawPortfolioOverview,
  PortfolioOverview
>((raw) => {
  const applicants =
    typeof raw.total_applicants === 'object'
      ? raw.total_applicants
      : { total: raw.total_applicants ?? 0, active: 0, previous: 0 };

  return {
    totalDistributedUsd: raw.total_distributed_usd ?? 0,
    activeRfps: {
      active: raw.active_grants?.active ?? 0,
      total: raw.active_grants?.total ?? 0,
    },
    totalApplicants: {
      total: applicants.total ?? 0,
      active: applicants.active ?? 0,
      previous: applicants.previous ?? 0,
    },
    matchedFundingUsd: raw.matched_funding_usd ?? 0,
    recentUpdates: raw.recent_updates ?? 0,
    proposalsFunded: raw.proposals_funded ?? 0,
  };
});
