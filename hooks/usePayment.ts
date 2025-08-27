import { useState, useCallback } from 'react';
import { PaymentService } from '@/services/payment.service';
import type { TransformedPaymentIntent } from '@/types/payment';

interface UsePaymentIntentReturn {
  paymentIntent: TransformedPaymentIntent | null;
  isLoading: boolean;
  error: string | null;
  createPaymentIntent: (
    amount: number,
    currency: 'USD' | 'RSC'
  ) => Promise<TransformedPaymentIntent>;
  reset: () => void;
}

/**
 * Hook to create and manage payment intents
 * @returns Object containing payment intent data, loading state, error state, and functions
 */
export function usePaymentIntent(): UsePaymentIntentReturn {
  const [paymentIntent, setPaymentIntent] = useState<TransformedPaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(
    async (amount: number, currency: 'USD' | 'RSC'): Promise<TransformedPaymentIntent> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PaymentService.createPaymentIntent({
          amount,
          currency,
        });

        setPaymentIntent(response.paymentIntent);
        return response.paymentIntent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
        setError(errorMessage);
        console.error('Error creating payment intent:', err);
        throw err; // Re-throw to allow component-level error handling
      } finally {
        setIsLoading(false);
      }
    },
    []
  ); // Empty dependency array since this function doesn't depend on any props or state

  const reset = useCallback(() => {
    setPaymentIntent(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    paymentIntent,
    isLoading,
    error,
    createPaymentIntent,
    reset,
  };
}
