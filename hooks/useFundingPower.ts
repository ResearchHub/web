'use client';

import { getAvailableAndPromotionalRscBalance } from '@/components/ResearchCoin/lib/promotionalBalance';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { formatCurrency } from '@/utils/currency';

interface UseFundingPowerReturn {
  /** False while the user — or, when showing USD, the exchange rate — is still loading. */
  isReady: boolean;
  /** No signed-in user, or nothing available to spend. */
  isEmpty: boolean;
  /** Spendable RSC plus fund-only credits. */
  total: number;
  /** Spendable RSC (available + promotional). */
  rscBalance: number;
  /** Fund-only credits. */
  fundingCredits: number;
  /** Formats an RSC amount in the currency the user has chosen to view. */
  format: (rscAmount: number) => string;
}

/**
 * The figures behind "funding power" — everything a user can put toward
 * research right now — plus the formatter that respects their USD/RSC
 * preference. Shared by every surface that displays the number so they can't
 * drift apart: the sidebar card, the inline bar on narrow screens, and the
 * pill that docks into the top bar.
 */
export const useFundingPower = (): UseFundingPowerReturn => {
  const { user, isLoading: isUserLoading } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isRateLoading } = useExchangeRate();

  const canShowUSD = showUSD && exchangeRate > 0;

  const format = (rscAmount: number) =>
    formatCurrency({
      amount: canShowUSD ? rscAmount * exchangeRate : rscAmount,
      showUSD: canShowUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const rscBalance = getAvailableAndPromotionalRscBalance(user);
  const fundingCredits = user?.fundingCredits ?? 0;
  const total = rscBalance + fundingCredits;

  return {
    isReady: !isUserLoading && (!showUSD || !isRateLoading),
    isEmpty: !user || total === 0,
    total,
    rscBalance,
    fundingCredits,
    format,
  };
};
