'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/utils/styles';
import type { ChecklistValue } from './types';

const styles: Record<ChecklistValue, string> = {
  NO: 'bg-red-50 text-red-800 border-red-200',
  PARTIAL: 'bg-amber-50 text-amber-900 border-amber-200',
  YES: 'bg-emerald-50 text-emerald-900 border-emerald-200',
};

const iconStyles: Record<ChecklistValue, string> = {
  NO: 'text-red-500',
  PARTIAL: 'text-amber-500',
  YES: 'text-emerald-500',
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
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles[value],
        className
      )}
    >
      <FontAwesomeIcon
        icon={value === 'YES' ? faCircleCheck : faCircleExclamation}
        className={cn('w-3 h-3', iconStyles[value])}
      />
      {labels[value]}
    </span>
  );
}
