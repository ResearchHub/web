'use client';

import { useEffect, useState } from 'react';
import { FunderService } from '@/services/funder.service';
import type { FunderOverview } from '@/types/funder';

interface UseFunderOverviewResult {
  overview: FunderOverview | null;
  isLoading: boolean;
}

/** A funder's totals and the people and proposals behind them, refetched when the funder changes. */
export function useFunderOverview(funderId: number | undefined): UseFunderOverviewResult {
  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!funderId) {
      setOverview(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    FunderService.getFundingOverview(funderId)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [funderId]);

  return { overview, isLoading };
}

/** The `user_id` query param a moderator uses to view another funder's page. */
export function parseViewedFunderId(userIdParam: string | null): number | undefined {
  if (!userIdParam) return undefined;
  const userId = Number(userIdParam);
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}
