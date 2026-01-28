'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useMemo, type ReactNode } from 'react';

// Placeholder publishable key - replace with environment variable in production
// You can set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Lazily load Stripe to avoid loading it on every page
let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

interface StripeProviderProps {
  children: ReactNode;
}

/**
 * Stripe Elements provider wrapper.
 * Initializes Stripe with the publishable key from environment variables.
 *
 * Note: Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment to enable Stripe.
 */
export function StripeProvider({ children }: StripeProviderProps) {
  const stripe = useMemo(() => getStripe(), []);

  // If no Stripe key is configured, render children without the provider
  // This allows the UI to be shown even without Stripe configured
  if (!STRIPE_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6', // primary-500
            colorBackground: '#ffffff',
            colorText: '#1f2937', // gray-800
            colorDanger: '#ef4444', // red-500
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e5e7eb', // gray-200
              boxShadow: 'none',
              padding: '12px',
            },
            '.Input:focus': {
              border: '1px solid #3b82f6', // primary-500
              boxShadow: '0 0 0 1px #3b82f6',
            },
            '.Label': {
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '6px',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
