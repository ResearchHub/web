import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/services/client';
import { GrantOverview, RawGrantOverview, transformGrantOverview } from '@/types/grantOverview';

export function useGrantOverview(postId: number, userId?: number) {
  const [overview, setOverview] = useState<GrantOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const params = userId ? `?user_id=${userId}` : '';
    ApiClient.get<RawGrantOverview>(`/api/grant/${postId}/overview/${params}`)
      .then((raw) => setOverview(transformGrantOverview(raw)))
      .catch(() => setError('Failed to load overview'))
      .finally(() => setIsLoading(false));
  }, [postId, userId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, isLoading, error, refetch: fetchOverview };
}
