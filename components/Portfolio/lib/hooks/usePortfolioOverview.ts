import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/client';
import {
  PortfolioOverview,
  RawPortfolioOverview,
  transformPortfolioOverview,
} from '@/types/portfolioOverview';

export function usePortfolioOverview(userId?: number) {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = userId ? `?user_id=${userId}` : '';
    ApiClient.get<RawPortfolioOverview>(`/api/fundraise/funding_overview/${params}`)
      .then((raw) => setOverview(transformPortfolioOverview(raw)))
      .catch(() => setError('Failed to load overview'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { overview, isLoading, error };
}
