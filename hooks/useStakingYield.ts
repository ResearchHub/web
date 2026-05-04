import { useState, useEffect, useCallback } from 'react';
import {
  StakingYieldService,
  StakingYieldStats,
  StakingYieldHistoryResponse,
  StakingYieldRange,
} from '@/services/staking-yield.service';

export function useStakingYieldStats() {
  const [stats, setStats] = useState<StakingYieldStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await StakingYieldService.getStats();
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch staking stats'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, isLoading, error };
}

export function useStakingYieldHistory(initialRange: StakingYieldRange = '90d') {
  const [range, setRange] = useState<StakingYieldRange>(initialRange);
  const [history, setHistory] = useState<StakingYieldHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async (r: StakingYieldRange) => {
    setIsLoading(true);
    try {
      const data = await StakingYieldService.getHistory(r);
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch staking history'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(range);
  }, [range, fetchHistory]);

  return { history, isLoading, error, range, setRange };
}
