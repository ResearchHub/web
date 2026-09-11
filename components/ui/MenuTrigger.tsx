'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

export type MenuTriggerVariant = 'chip' | 'inline' | 'touch';

const VARIANT_CLASSES: Record<
  MenuTriggerVariant,
  { button: string; label: string; chevron: string }
> = {
  /** Composer-row control: quiet chip that fills on hover and while open. */
  chip: {
    button:
      'gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900',
    label: '',
    chevron: 'h-3 w-3',
  },
  /** Bare text in a heading row: only the label reads as a control. */
  inline: {
    button: 'gap-1 text-xs text-gray-500 hover:text-gray-700 sm:text-sm',
    label: 'font-medium text-gray-700',
    chevron: 'h-3 w-3',
  },
  /** Touch-sized for list toolbars: a 44px target that fills on press. */
  touch: {
    button:
      '-mr-2 min-h-[44px] gap-1.5 rounded-lg px-2 text-sm text-gray-500 touch-manipulation hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100',
    label: 'font-medium text-gray-700',
    chevron: 'h-4 w-4',
  },
};

export interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: MenuTriggerVariant;
  /** Leading glyph, drawn before the label. */
  readonly icon?: ReactNode;
  /** Screen-reader prefix naming what the label is, e.g. "Sort by:". */
  readonly srLabel?: string;
  readonly 'data-testid'?: string;
  readonly children: ReactNode;
}

/**
 * The button that opens a menu or popover: optional icon, label, chevron.
 * Forwards its ref and spreads the rest of its props so a Radix trigger can
 * drive it (`asChild`); the chevron turns on the `data-state` Radix stamps on
 * an open trigger, so callers need not track open state themselves.
 */
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(
  { variant = 'chip', icon, srLabel, className, children, ...props },
  ref
) {
  const classes = VARIANT_CLASSES[variant];
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        'group inline-flex min-w-0 items-center transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        classes.button,
        className
      )}
    >
      {icon}
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <span className={cn('truncate', classes.label)}>{children}</span>
      <ChevronDown
        className={cn(
          'shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180',
          classes.chevron
        )}
        aria-hidden="true"
      />
    </button>
  );
});
