import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/client';
import { ImpactData, RawImpactData, transformImpactData } from '@/types/impactData';

export function useImpactData(userId?: number) {
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = userId ? `?user_id=${userId}` : '';
    ApiClient.get<RawImpactData>(`/api/fundraise/funding_impact/${params}`)
      .then((raw) => setData(transformImpactData(raw)))
      .catch(() => setError('Failed to load impact data'))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { data, isLoading, error };
}
