import { createTransformer } from './transformer';

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

export const transformPortfolioOverview = createTransformer<any, PortfolioOverview>((raw) => {
  // Handle both old format (number) and new format (object) for total_applicants
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
