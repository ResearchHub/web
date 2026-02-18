import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/client';
import { ImpactData, RawImpactData, transformImpactData } from '@/types/impactData';

export function useImpactData(userId?: number) {
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setData(null);
    setError(null);
    setIsLoading(true);

    const query = userId ? `?user_id=${userId}` : '';

    ApiClient.get<RawImpactData>(`/api/fundraise/funding_impact/${query}`)
      .then((raw) => {
        if (!cancelled) setData(transformImpactData(raw));
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
