import { createTransformer } from './transformer';

// Raw API response (snake_case)
export interface RawGrantOverview {
  budget_used_usd?: number;
  budget_total_usd?: number;
  matched_funding_usd?: number;
  proposals_funded?: number;
  total_proposals?: number;
  proposals_with_updates?: number;
}

// Transformed type (camelCase)
export interface GrantOverview {
  budgetUsedUsd: number;
  budgetTotalUsd: number;
  matchedFundingUsd: number;
  proposalsFunded: number;
  reviewProposals: number;
  progressUpdates: number;
}

export const transformGrantOverview = createTransformer<RawGrantOverview, GrantOverview>((raw) => ({
  budgetUsedUsd: raw.budget_used_usd ?? 0,
  budgetTotalUsd: raw.budget_total_usd ?? 0,
  matchedFundingUsd: raw.matched_funding_usd ?? 0,
  proposalsFunded: raw.proposals_funded ?? 0,
  reviewProposals: raw.total_proposals ?? 0,
  progressUpdates: raw.proposals_with_updates ?? 0,
}));
