'use client';

import { useEffect, useState } from 'react';
import { FunderService } from '@/services/funder.service';
import type { FunderOverview } from '@/types/funder';

interface UseFunderOverviewResult {
  overview: FunderOverview | null;
  isLoading: boolean;
  error: Error | null;
}

/** A funder's totals and the people and proposals behind them, refetched when the funder changes. */
export function useFunderOverview(funderId: number | undefined): UseFunderOverviewResult {
  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!funderId) {
      setOverview(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    FunderService.getFundingOverview(funderId)
      .then((data) => {
        if (!cancelled) {
          setOverview(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const nextError =
            err instanceof Error ? err : new Error('Failed to load funding overview');
          console.error('Failed to load funding overview:', nextError);
          setOverview(null);
          setError(nextError);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [funderId]);

  return { overview, isLoading, error };
}

/** The `user_id` query param a moderator uses to view another funder's page. */
export function parseViewedFunderId(userIdParam: string | null): number | undefined {
  if (!userIdParam) return undefined;
  const userId = Number(userIdParam);
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}
