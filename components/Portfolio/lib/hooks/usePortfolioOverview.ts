import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/client';
import {
  PortfolioOverview,
  RawPortfolioOverview,
  transformPortfolioOverview,
} from '@/types/portfolioOverview';

export function usePortfolioOverview() {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.get<RawPortfolioOverview>('/api/fundraise/funding_overview/')
      .then((raw) => setOverview(transformPortfolioOverview(raw)))
      .catch(() => setError('Failed to load overview'))
      .finally(() => setIsLoading(false));
  }, []);

  return { overview, isLoading, error };
}
