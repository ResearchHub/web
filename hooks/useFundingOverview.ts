'use client';

import { useEffect, useState } from 'react';
import { FunderService } from '@/services/funder.service';
import { FunderOverview } from '@/types/funder';
import { useUser } from '@/contexts/UserContext';

interface UseFundingOverviewReturn {
  overview: FunderOverview | null;
  isLoading: boolean;
}

/**
 * Fetches the current user's funding overview (amount given, credits, supported
 * researchers, etc.). Resolves to `null` for signed-out users. Shared by the
 * funding snapshot surfaces (Fund, Earn, and ResearchCoin pages).
 */
export function useFundingOverview(): UseFundingOverviewReturn {
  const { user, isLoading: isLoadingUser } = useUser();
  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingUser) return;

    if (!user) {
      setOverview(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    FunderService.getFundingOverview(user.id)
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
  }, [user, isLoadingUser]);

  return { overview, isLoading };
}
