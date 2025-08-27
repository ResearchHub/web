'use client';

import { Appearance, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';
import { colors } from '@/app/styles/colors';

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    // Use your color system from colors.ts
    colorPrimary: colors.rhBlue[500], // #3971ff
    colorBackground: '#ffffff',
    colorText: colors.gray[900], // #111827
    colorTextSecondary: colors.gray[600], // #4b5563
    colorTextPlaceholder: colors.gray[400], // #9ca3af
    colorDanger: '#ef4444', // red-500
    colorSuccess: '#10b981', // green-500
    colorWarning: '#f59e0b', // amber-500

    // Typography
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '14px',

    // Spacing and sizing
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    // Custom styling rules for specific components
    '.Tab': {
      border: `1px solid ${colors.gray[200]}`,
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px',
      backgroundColor: '#ffffff',
      display: 'none',
    },
    '.Tab:hover': {
      backgroundColor: colors.gray[50],
      borderColor: colors.gray[300],
    },
    '.Tab--selected': {
      borderColor: colors.rhBlue[500],
      backgroundColor: colors.rhBlue[50],
    },
    '.TabLabel': {
      color: colors.gray[700],
      fontWeight: '500',
    },
    '.TabLabel--selected': {
      color: colors.rhBlue[700],
      fontWeight: '600',
    },
    '.Input': {
      border: `1px solid ${colors.gray[200]}`,
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      color: colors.gray[900],
      backgroundColor: '#ffffff',
    },
    '.Input:focus': {
      borderColor: colors.rhBlue[500],
      outline: 'none',
    },
    '.Input:hover': {
      borderColor: colors.gray[300],
    },
    '.Input--invalid': {
      borderColor: '#ef4444',
    },
    '.Label': {
      color: colors.gray[700],
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
    },
    '.ErrorText': {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px',
    },
    '.PaymentRequestButton': {
      backgroundColor: colors.rhBlue[500],
      color: '#ffffff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
    },
    '.PaymentRequestButton:hover': {
      backgroundColor: colors.rhBlue[600],
    },
    '.PaymentRequestButton:active': {
      backgroundColor: colors.rhBlue[700],
    },
  },
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeWrapperProps {
  children: ReactNode;
  options?: StripeElementsOptions;
}

export const StripeWrapper: React.FC<StripeWrapperProps> = ({ children, options }) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: appearance,
        ...options,
      }}
    >
      {children}
    </Elements>
  );
};
