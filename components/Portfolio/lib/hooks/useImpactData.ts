import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/client';
import { ImpactData, RawImpactData, transformImpactData } from '@/types/impactData';

export function useImpactData() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiClient.get<RawImpactData>('/api/fundraise/funding_impact/')
      .then((raw) => setData(transformImpactData(raw)))
      .catch(() => setError('Failed to load impact data'))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
