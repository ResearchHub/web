'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface InsufficientBalanceAlertProps {
  className?: string;
}

/**
 * Alert displayed when user has insufficient RSC balance for a contribution.
 */
export function InsufficientBalanceAlert({ className }: InsufficientBalanceAlertProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1 text-sm text-amber-800">
        Insufficient ResearchCoin. Please select a different payment method.
      </div>
    </div>
  );
}
