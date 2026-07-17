import { useState, useEffect } from 'react';
import { UserService } from '@/services/user.service';
import type { EarningOverview } from '@/types/user';

export function useEarningOverview(userId: number | undefined) {
  const [overview, setOverview] = useState<EarningOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId === undefined) {
      setIsLoading(false);
      return;
    }

    const id = userId;
    let cancelled = false;

    async function fetchOverview() {
      setIsLoading(true);

      try {
        const data = await UserService.getEarningOverview(id);
        if (!cancelled) {
          setOverview(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch earning overview'));
          setOverview(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { overview, isLoading, error };
}
