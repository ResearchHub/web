'use client';

import { useMemo } from 'react';
import { getActiveBounties, getTotalBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { Bounty } from '@/types/bounty';
import { formatCurrency } from '@/utils/currency';

/**
 * What a work's open bounties add up to, shortened ("$1.2K", or "1.2K" in
 * RSC, which callers label themselves). Null when nothing is open, or while
 * the rate a dollar figure needs is still loading.
 */
export function useActiveBountyAmount(bounties: Bounty[]): string | null {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();

  const activeBounties = useMemo(() => getActiveBounties(bounties), [bounties]);
  const { amount } = useMemo(
    () => getTotalBountyDisplayAmount(activeBounties, exchangeRate, showUSD),
    [activeBounties, exchangeRate, showUSD]
  );

  if (activeBounties.length === 0) return null;
  if (showUSD && (isExchangeRateLoading || exchangeRate <= 0)) return null;

  return formatCurrency({
    amount,
    showUSD,
    exchangeRate,
    shorten: true,
    skipConversion: showUSD,
  });
}
