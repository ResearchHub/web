import { ApiClient } from './client';

export interface StakingYieldStats {
  accrual_date: string | null;
  apy: number;
  apy_30d_avg: number;
  holders: number;
  top_10_concentration_pct: number;
  total_staked_rsc: string;
  total_value_locked_usd: string | null;
  circulating_supply_rsc: string;
  pct_of_supply_staked: number;
  issued_today_rsc: string | null;
  issued_today_usd: string | null;
}

export interface StakingYieldHistoryEntry {
  accrual_date: string;
  apy: number;
  total_staked_rsc: string;
  total_value_locked_usd: string | null;
  holders: number;
}

export type StakingYieldRange = '7d' | '30d' | '90d' | 'all';

export interface StakingYieldHistoryResponse {
  range: string;
  results: StakingYieldHistoryEntry[];
}

export class StakingYieldService {
  static async getStats(): Promise<StakingYieldStats> {
    return ApiClient.getPublic<StakingYieldStats>('/api/staking_yield/stats/');
  }

  static async getHistory(range: StakingYieldRange = '90d'): Promise<StakingYieldHistoryResponse> {
    return ApiClient.getPublic<StakingYieldHistoryResponse>(
      `/api/staking_yield/history/?range=${range}`
    );
  }
}
