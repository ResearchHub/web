import { useState, useEffect, useCallback } from 'react';
import { AIService } from '@/services/ai.service';
import type { AIUsageResponse } from '@/types/ai';

export function useAIUsage(pollingInterval?: number) {
  const [usage, setUsage] = useState<AIUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AIService.getUsage();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    if (pollingInterval) {
      const interval = setInterval(fetchUsage, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchUsage, pollingInterval]);

  const percentageUsed = usage
    ? {
        completions: (usage.completions_used / usage.completions_limit) * 100,
        messages: (usage.messages_used / usage.messages_limit) * 100,
      }
    : null;

  return { usage, percentageUsed, isLoading, error, refetch: fetchUsage };
}
