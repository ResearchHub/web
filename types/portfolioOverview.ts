import { createTransformer } from './transformer';

export interface ActiveRfps {
  active: number;
  total: number;
}

export interface PortfolioOverview {
  totalDistributedUsd: number;
  activeRfps: ActiveRfps;
  totalApplicants: number;
  matchedFundingUsd: number;
  recentUpdates: number;
  proposalsFunded: number;
}

export const transformPortfolioOverview = createTransformer<any, PortfolioOverview>((raw) => ({
  totalDistributedUsd: raw.total_distributed_usd ?? 0,
  activeRfps: {
    active: raw.active_rfps?.active ?? 0,
    total: raw.active_rfps?.total ?? 0,
  },
  totalApplicants: raw.total_applicants ?? 0,
  matchedFundingUsd: raw.matched_funding_usd ?? 0,
  recentUpdates: raw.recent_updates ?? 0,
  proposalsFunded: raw.proposals_funded ?? 0,
}));
