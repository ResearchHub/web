import { useState, useEffect } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { FundingImpactData, transformFundingImpactData } from '@/types/fundingImpactData';

export function useImpactData(userId?: number) {
  const [data, setData] = useState<FundingImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setData(null);
    setError(null);
    setIsLoading(true);

    FundraiseService.getFundingImpact(userId)
      .then((raw) => {
        if (!cancelled) setData(transformFundingImpactData(raw));
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load impact data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, isLoading, error };
}
