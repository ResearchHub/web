'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface InsufficientBalanceAlertProps {
  /** Callback when user clicks "Add funds" */
  onAddFunds: () => void;
  className?: string;
}

/**
 * Alert displayed when user has insufficient balance for a contribution.
 * Includes a highlighted "Add funds" action button.
 */
export function InsufficientBalanceAlert({ onAddFunds, className }: InsufficientBalanceAlertProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1 text-sm text-amber-800">
        Insufficient funds.{' '}
        <button
          type="button"
          onClick={onAddFunds}
          className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2"
        >
          Add funds
        </button>{' '}
        to continue.
      </div>
    </div>
  );
}
