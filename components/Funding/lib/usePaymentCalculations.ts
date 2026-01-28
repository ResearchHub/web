'use client';

import { useMemo } from 'react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { PAYMENT_FEES, type PaymentMethodType } from './constants';

interface UsePaymentCalculationsOptions {
  /** Amount in RSC to pay */
  amountInRsc: number;
  /** User's current RSC balance (for balance check) */
  rscBalance?: number;
  /** Payment method to determine fee percentage */
  paymentMethod: Exclude<PaymentMethodType, 'endaoment'>;
}

interface UsePaymentCalculationsReturn {
  /** Platform fee in RSC */
  platformFee: number;
  /** Total amount including fee in RSC */
  totalAmount: number;
  /** Whether the user has insufficient RSC balance (only relevant for RSC payments) */
  insufficientBalance: boolean;
  /** Fee percentage being used */
  feePercentage: number;
  /** Format an RSC amount to display string */
  formatRsc: (amount: number) => string;
  /** Format a USD amount to display string */
  formatUsd: (amount: number) => string;
  /** Convert RSC to USD */
  rscToUsd: (rsc: number) => number;
  /** Convert USD to RSC */
  usdToRsc: (usd: number) => number;
  /** Total amount in USD */
  totalAmountUsd: number;
}

/**
 * Hook for payment calculations.
 * Handles fee calculation based on payment method, balance checks, and currency formatting.
 */
export function usePaymentCalculations({
  amountInRsc,
  rscBalance = 0,
  paymentMethod,
}: UsePaymentCalculationsOptions): UsePaymentCalculationsReturn {
  const { exchangeRate } = useExchangeRate();

  // Get fee percentage from constants
  const feePercentage = PAYMENT_FEES[paymentMethod];

  // Currency conversion helpers
  const rscToUsd = useMemo(
    () => (rsc: number) => (exchangeRate ? rsc * exchangeRate : 0),
    [exchangeRate]
  );

  const usdToRsc = useMemo(
    () => (usd: number) => (exchangeRate ? usd / exchangeRate : 0),
    [exchangeRate]
  );

  // Calculate fee and total
  const platformFee = useMemo(
    () => Math.round(amountInRsc * (feePercentage / 100) * 100) / 100,
    [amountInRsc, feePercentage]
  );

  const totalAmount = useMemo(() => amountInRsc + platformFee, [amountInRsc, platformFee]);

  const totalAmountUsd = useMemo(() => rscToUsd(totalAmount), [rscToUsd, totalAmount]);

  // Balance check (only relevant for RSC payments)
  const insufficientBalance = useMemo(
    () => paymentMethod === 'rsc' && rscBalance < totalAmount,
    [paymentMethod, rscBalance, totalAmount]
  );

  // Format helpers
  const formatUsd = useMemo(
    () => (amount: number) =>
      `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    []
  );

  const formatRsc = useMemo(
    () => (amount: number) =>
      `${amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} RSC`,
    []
  );

  return {
    platformFee,
    totalAmount,
    insufficientBalance,
    feePercentage,
    formatRsc,
    formatUsd,
    rscToUsd,
    usdToRsc,
    totalAmountUsd,
  };
}
