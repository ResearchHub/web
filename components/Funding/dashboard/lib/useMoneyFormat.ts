'use client';

import { useCallback } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import type { Money } from './myFundingModel';

/**
 * Formats an amount held in both currencies in the one the user prefers. Both
 * figures were fixed when the money moved, so neither is converted at today's
 * rate.
 */
export function useMoneyFormat() {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  return useCallback(
    (amount: Money, options?: { shorten?: boolean }) =>
      formatCurrency({
        amount: showUSD ? amount.usd : amount.rsc,
        showUSD,
        exchangeRate,
        shorten: options?.shorten ?? false,
        skipConversion: true,
      }),
    [showUSD, exchangeRate]
  );
}
