'use client';

import { useState, useEffect, useCallback } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CreditCard, Lock } from 'lucide-react';
import { StripeProvider } from './StripeProvider';

/**
 * Stripe context provided to parent for payment confirmation.
 */
export interface StripePaymentContext {
  stripe: Stripe;
  cardElement: StripeCardElement;
}

interface CreditCardFormProps {
  /** Amount to display in the pay button */
  amountDisplay: string;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Called when form is submitted (placeholder - not functional yet) */
  onSubmit?: () => void;
  /** Hide the submit button (when used inline with external submit) */
  hideSubmitButton?: boolean;
  /** Called when card completeness state changes */
  onCardComplete?: (isComplete: boolean) => void;
  /** Called when Stripe context is ready, providing access for payment confirmation */
  onStripeReady?: (context: StripePaymentContext | null) => void;
}

/**
 * Placeholder form shown when Stripe is not configured.
 */
function CreditCardFormPlaceholder({
  amountDisplay,
  hideSubmitButton = false,
  onCardComplete,
  onStripeReady,
}: {
  amountDisplay: string;
  hideSubmitButton?: boolean;
  onCardComplete?: (isComplete: boolean) => void;
  onStripeReady?: (context: StripePaymentContext | null) => void;
}) {
  // Card is never complete in placeholder mode
  useEffect(() => {
    onCardComplete?.(false);
  }, [onCardComplete]);

  // Stripe is not available in placeholder mode
  useEffect(() => {
    onStripeReady?.(null);
  }, [onStripeReady]);
  return (
    <div className="space-y-4">
      {/* Card Element Container - Placeholder */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Card details</label>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-3 text-gray-400">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Card number, expiry, CVC</span>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe. We never store your card details.</span>
      </div>

      {/* Backend integration notice */}
      <Alert variant="info">
        Credit card payments are not yet available. Please use ResearchCoin for now.
      </Alert>

      {/* Disabled Submit Button */}
      {!hideSubmitButton && (
        <Button type="button" variant="default" disabled className="w-full h-12 text-base">
          Pay {amountDisplay}
        </Button>
      )}
    </div>
  );
}

/**
 * Actual Stripe form - only rendered when wrapped in Elements provider.
 */
function StripeCardForm({
  amountDisplay,
  isSubmitting = false,
  onSubmit,
  hideSubmitButton = false,
  onCardComplete,
  onStripeReady,
}: CreditCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Notify parent when card completeness changes
  useEffect(() => {
    onCardComplete?.(cardComplete);
  }, [cardComplete, onCardComplete]);

  // Notify parent when Stripe context is ready
  useEffect(() => {
    if (stripe && elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        onStripeReady?.({ stripe, cardElement });
      }
    } else {
      onStripeReady?.(null);
    }
  }, [stripe, elements, onStripeReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Placeholder - actual payment processing will be implemented
    // when backend endpoint is ready
    onSubmit?.();
  };

  const stripeReady = stripe && elements;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Element Container */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Card details</label>
        <div className="border border-gray-200 rounded-lg p-3 bg-white focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
              hidePostalCode: false,
            }}
            onChange={(event) => {
              setCardComplete(event.complete);
              if (event.error) {
                setCardError(event.error.message);
              } else {
                setCardError(null);
              }
            }}
          />
        </div>
        {cardError && <p className="text-sm text-red-500">{cardError}</p>}
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe. We never store your card details.</span>
      </div>

      {/* Submit Button */}
      {!hideSubmitButton && (
        <Button
          type="submit"
          variant="default"
          disabled={!stripeReady || !cardComplete || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? 'Processing...' : `Pay ${amountDisplay}`}
        </Button>
      )}
    </form>
  );
}

// Check if Stripe key is configured at module level
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Credit card form component.
 * Shows Stripe Elements when configured, or a placeholder when not.
 */
export function CreditCardForm(props: CreditCardFormProps) {
  // If no Stripe key, show placeholder without attempting to use Stripe hooks
  if (!STRIPE_KEY) {
    return (
      <CreditCardFormPlaceholder
        amountDisplay={props.amountDisplay}
        hideSubmitButton={props.hideSubmitButton}
        onCardComplete={props.onCardComplete}
        onStripeReady={props.onStripeReady}
      />
    );
  }

  // Wrap with Stripe provider only when key is available
  return (
    <StripeProvider>
      <StripeCardForm {...props} />
    </StripeProvider>
  );
}
