import { useState, useEffect, useCallback } from 'react';
import { AIService } from '@/services/ai.service';
import type { AISubscriptionResponse } from '@/types/ai';

export function useAISubscription() {
  const [subscription, setSubscription] = useState<AISubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AIService.getSubscription();
      setSubscription(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createCheckout = useCallback(async () => {
    try {
      const { url } = await AIService.createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create checkout'));
      throw err;
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      await AIService.cancelSubscription();
      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel subscription'));
      throw err;
    }
  }, [fetchSubscription]);

  return {
    subscription,
    isLoading,
    error,
    createCheckout,
    cancel,
    refetch: fetchSubscription,
  };
}
