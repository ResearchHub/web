'use client';

import { useRef, type KeyboardEvent } from 'react';
import { CURRENCIES, type CurrencyOption } from '@/app/layouts/components/helpLinks';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { cn } from '@/utils/styles';

/**
 * USD | RSC: which currency amounts are shown in, everywhere. A radio group, so
 * the arrow keys move between the two and Tab reaches the checked one.
 */
export function CurrencySwitch({ className }: { readonly className?: string }) {
  const { showUSD, toggleCurrency } = useCurrencyPreference();
  const current: CurrencyOption = showUSD ? 'USD' : 'RSC';
  const refs = useRef<Record<CurrencyOption, HTMLButtonElement | null>>({ USD: null, RSC: null });

  const pick = (option: CurrencyOption) => {
    if (option !== current) toggleCurrency();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const other: CurrencyOption = current === 'USD' ? 'RSC' : 'USD';
    pick(other);
    refs.current[other]?.focus();
  };

  return (
    <span
      role="radiogroup"
      aria-label="Currency"
      className={cn('inline-flex shrink-0 rounded-[9px] bg-gray-100 p-0.5', className)}
    >
      {CURRENCIES.map((option) => {
        const isChecked = option === current;
        return (
          <button
            key={option}
            ref={(element) => {
              refs.current[option] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isChecked}
            tabIndex={isChecked ? 0 : -1}
            onClick={() => pick(option)}
            onKeyDown={onKeyDown}
            className={cn(
              'rounded-[7px] px-2.5 py-[3px] text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-500',
              isChecked
                ? 'bg-white font-semibold text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                : 'font-medium text-gray-500 hover:text-gray-900'
            )}
          >
            {option}
          </button>
        );
      })}
    </span>
  );
}
