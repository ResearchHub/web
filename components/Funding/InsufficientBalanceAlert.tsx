'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface InsufficientBalanceAlertProps {
  /** Callback when user clicks "Deposit RSC" */
  onDepositRsc: () => void;
  /** Callback when user clicks "Buy RSC" */
  onBuyRsc: () => void;
  className?: string;
}

/**
 * Alert displayed when user has insufficient balance for a contribution.
 * Includes "Deposit RSC" and "Buy RSC" action buttons.
 */
export function InsufficientBalanceAlert({
  onDepositRsc,
  onBuyRsc,
  className,
}: InsufficientBalanceAlertProps) {
  const linkButtonClass =
    'font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2';

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
        <button type="button" onClick={onDepositRsc} className={linkButtonClass}>
          Deposit RSC
        </button>{' '}
        or{' '}
        <button type="button" onClick={onBuyRsc} className={linkButtonClass}>
          Buy RSC
        </button>{' '}
        to continue.
      </div>
    </div>
  );
}
