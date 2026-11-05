import { useState, useEffect } from 'react';
import { UserService } from '@/services/user.service';
import type { EarningOverview } from '@/types/user';

export function useEarningOverview(userId: number | undefined) {
  const [overview, setOverview] = useState<EarningOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // The user the current numbers belong to. Until it matches, the hook is
  // loading, even in the render before its effect has started the request.
  const [loadedFor, setLoadedFor] = useState<number | undefined>();

  useEffect(() => {
    if (userId === undefined) {
      setIsLoading(false);
      setLoadedFor(undefined);
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
          const nextError =
            err instanceof Error ? err : new Error('Failed to fetch earning overview');
          console.error('Failed to fetch earning overview:', nextError);
          setError(nextError);
          setOverview(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setLoadedFor(id);
        }
      }
    }

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { overview, isLoading: isLoading || loadedFor !== userId, error };
}
