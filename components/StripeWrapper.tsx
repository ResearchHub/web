'use client';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeWrapperProps {
  children: ReactNode;
  options?: StripeElementsOptions;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({
  children,
  options = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3971ff',
      },
    },
  },
}) => {
  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};
