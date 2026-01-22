'use client';

import { cn } from '@/utils/styles';
import type { ContributionCurrency } from './CurrencyRadioGroup';

interface FeeLineItemProps {
  /** The contribution amount (before fees) */
  amount: number;
  /** The currency type */
  currency: ContributionCurrency;
  /** Fee percentage (e.g., 9 for 9%, 12 for 12%) */
  feePercentage: number;
  className?: string;
}

/**
 * Fee and total display component.
 * Shows the fee as a line item, a divider, and the total amount.
 */
export function FeeLineItem({ amount, currency, feePercentage, className }: FeeLineItemProps) {
  const fee = Math.round(amount * (feePercentage / 100) * 100) / 100;
  const total = amount + fee;

  const formatAmount = (value: number) => {
    if (currency === 'USD') {
      return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${value.toLocaleString()} RSC`;
  };

  // Don't show anything if amount is 0
  if (amount <= 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3 px-3', className)}>
      {/* Fee line item */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Platform fee ({feePercentage}%)</span>
        <span className="text-gray-500">{formatAmount(fee)}</span>
      </div>

      {/* Subtle divider */}
      <div className="border-t border-dashed border-gray-200" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">Total</span>
        <span className="font-semibold text-gray-900">{formatAmount(total)}</span>
      </div>
    </div>
  );
}
