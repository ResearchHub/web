'use client';

import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';
import { FieldLabel } from '@/components/ui/FieldLabel';

export interface ChoicePillsProps<T extends string> {
  readonly label: string;
  readonly value: T | undefined;
  readonly choices: ReadonlyArray<{ readonly value: T; readonly label: string }>;
  readonly onChange: (value: T | undefined) => void;
  /**
   * Leads the row with a pill that clears the choice, named here — "Auto",
   * "Any" — so leaving a control alone stays reachable once it has been set.
   */
  readonly unsetLabel?: string;
  readonly hint?: ReactNode;
  readonly className?: string;
}

/**
 * A labelled row of compact single-choice pills. One line, always: a row too
 * wide for its container scrolls rather than wrapping into an orphan.
 */
export function ChoicePills<T extends string>({
  label,
  value,
  choices,
  onChange,
  unsetLabel,
  hint,
  className,
}: ChoicePillsProps<T>) {
  const items: ReadonlyArray<{ value: T | undefined; label: string }> = unsetLabel
    ? [{ value: undefined, label: unsetLabel }, ...choices]
    : choices;

  return (
    <div className={className}>
      <FieldLabel className="mb-1.5">{label}</FieldLabel>
      {/* w-max so the pills keep their natural size and the row scrolls past
          the edge rather than compressing them. */}
      <div className="scrollbar-hide overflow-x-auto" role="group" aria-label={label}>
        <div className="flex w-max gap-[3px]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.value)}
              aria-pressed={value === item.value}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                value === item.value
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-gray-500">{hint}</p>}
    </div>
  );
}
