'use client';

import { cn } from '@/utils/styles';
import type { ChecklistValue } from './types';

const styles: Record<ChecklistValue, string> = {
  NO: 'bg-red-50 text-red-800 border-red-200',
  PARTIAL: 'bg-amber-50 text-amber-900 border-amber-200',
  YES: 'bg-emerald-50 text-emerald-900 border-emerald-200',
};

const labels: Record<ChecklistValue, string> = {
  NO: 'No',
  PARTIAL: 'Partial',
  YES: 'Yes',
};

export function ChecklistValueBadge({
  value,
  className,
}: {
  value: ChecklistValue;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles[value],
        className
      )}
    >
      {labels[value]}
    </span>
  );
}
