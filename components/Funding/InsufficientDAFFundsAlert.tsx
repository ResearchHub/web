'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/styles';

interface InsufficientDAFFundsAlertProps {
  className?: string;
}

/**
 * Alert displayed when selected DAF account has insufficient balance.
 * Prompts user to select a different account or add funds via Endaoment.
 */
export function InsufficientDAFFundsAlert({ className }: InsufficientDAFFundsAlertProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <p className="flex-1 text-sm text-amber-800">
        This DAF account has insufficient funds. Select a different account or add funds via
        Endaoment.
      </p>
    </div>
  );
}
