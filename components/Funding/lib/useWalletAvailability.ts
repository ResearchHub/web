'use client';

import { useState, useEffect, useRef } from 'react';
import { useStripe } from '@stripe/react-stripe-js';

/**
 * Wallet payment method availability on the current device.
 */
export interface WalletAvailability {
  /** Still waiting for canMakePayment() to resolve */
  checking: boolean;
  /** Apple Pay is available on this device */
  applePay: boolean;
  /** Google Pay is available on this device */
  googlePay: boolean;
}

const INITIAL_STATE: WalletAvailability = {
  checking: true,
  applePay: false,
  googlePay: false,
};

/**
 * Hook to check wallet payment method availability (Apple Pay, Google Pay)
 * via Stripe's canMakePayment() API.
 *
 * Must be called inside a StripeProvider (Stripe Elements context).
 *
 * Creates a throwaway PaymentRequest with a $1 dummy amount to check
 * device capabilities. The result (which wallets are available) does not
 * depend on the amount — it's purely a device/browser capability check.
 *
 * The check runs exactly once per component mount. A ref guard prevents
 * duplicate Stripe API calls even if the effect re-fires (e.g., due to
 * React StrictMode or parent re-renders).
 */
export function useWalletAvailability(): WalletAvailability {
  const stripe = useStripe();
  const [availability, setAvailability] = useState<WalletAvailability>(INITIAL_STATE);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!stripe || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'Availability Check', amount: 100 }, // $1 dummy
      requestPayerName: false,
      requestPayerEmail: false,
    });

    pr.canMakePayment()
      .then((result) => {
        const applePay = !!result?.applePay;
        const googlePay = !!result?.googlePay;

        // Debug: log wallet availability for production diagnostics
        console.log('[useWalletAvailability] canMakePayment result:', {
          raw: result,
          applePay,
          googlePay,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        });

        if (result) {
          setAvailability({ checking: false, applePay, googlePay });
        } else {
          setAvailability({ checking: false, applePay: false, googlePay: false });
        }
      })
      .catch((err) => {
        console.log('[useWalletAvailability] canMakePayment error:', err);
        setAvailability({ checking: false, applePay: false, googlePay: false });
      });
  }, [stripe]);

  return availability;
}
