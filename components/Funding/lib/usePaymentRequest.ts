'use client';

import { useState, useEffect, useRef } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest } from '@stripe/stripe-js';

export interface WalletAvailability {
  /** Still waiting for canMakePayment() to resolve */
  checking: boolean;
  /** Apple Pay is available */
  applePay: boolean;
  /** Google Pay is available */
  googlePay: boolean;
  /** Stripe Link is available (fallback when neither Apple Pay nor Google Pay) */
  link: boolean;
  /** At least one wallet payment method is available */
  any: boolean;
}

interface UsePaymentRequestOptions {
  /** Amount in cents for the payment request */
  amountCents: number;
  /** Label shown in the payment sheet */
  label?: string;
}

/**
 * Hook to create a Stripe PaymentRequest and check wallet payment method availability.
 * Must be called inside a StripeProvider (Stripe Elements context).
 *
 * Checks once on mount whether Apple Pay, Google Pay, or Stripe Link are available.
 * The returned `paymentRequest` can be passed to `PaymentRequestButton` for rendering.
 * The returned `availability` can be used to filter payment options in the UI.
 */
export function usePaymentRequest({
  amountCents,
  label = 'Fund Research',
}: UsePaymentRequestOptions) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [availability, setAvailability] = useState<WalletAvailability>({
    checking: true,
    applePay: false,
    googlePay: false,
    link: false,
    any: false,
  });

  // Use refs for values that shouldn't trigger re-creation of the PaymentRequest.
  // Only `stripe` should trigger re-creation; amount/label changes are handled via .update().
  const amountCentsRef = useRef(amountCents);
  amountCentsRef.current = amountCents;
  const labelRef = useRef(label);
  labelRef.current = label;

  // Create PaymentRequest and check availability once when Stripe loads
  useEffect(() => {
    if (!stripe) return;

    // Use current ref values for initial creation
    const currentAmount = amountCentsRef.current;
    const currentLabel = labelRef.current;

    if (currentAmount <= 0) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: currentLabel,
        amount: currentAmount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment()
      .then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setAvailability({
            checking: false,
            applePay: !!result.applePay,
            googlePay: !!result.googlePay,
            // Link is available when canMakePayment returns truthy
            // but neither Apple Pay nor Google Pay are available
            link: !result.applePay && !result.googlePay,
            any: true,
          });
        } else {
          setAvailability({
            checking: false,
            applePay: false,
            googlePay: false,
            link: false,
            any: false,
          });
        }
      })
      .catch(() => {
        setAvailability({
          checking: false,
          applePay: false,
          googlePay: false,
          link: false,
          any: false,
        });
      });

    return () => {
      setPaymentRequest(null);
    };
  }, [stripe]); // Only re-run when Stripe instance changes

  // Update payment request amount/label when they change (without re-creating)
  useEffect(() => {
    if (paymentRequest && amountCents > 0) {
      paymentRequest.update({
        total: {
          label,
          amount: amountCents,
        },
      });
    }
  }, [paymentRequest, amountCents, label]);

  return { paymentRequest, availability };
}
