import { formatRSC } from './number';

interface FormatCurrencyOptions {
  amount: number;
  showUSD: boolean;
  exchangeRate: number;
  shorten?: boolean;
  /**
   * If true, the amount is already in the target currency and should not be converted.
   * Useful when the caller has pre-calculated the amount (e.g., Foundation bounty flat fee).
   */
  skipConversion?: boolean;
}

export const formatCurrency = ({
  amount,
  showUSD,
  exchangeRate,
  shorten = false,
  skipConversion = false,
}: FormatCurrencyOptions): string => {
  if (showUSD) {
    // Use the amount as-is if skipConversion is true, otherwise convert from RSC to USD
    const usdAmount = skipConversion ? amount : exchangeRate > 0 ? amount * exchangeRate : amount;
    if (shorten && usdAmount >= 1000) {
      if (usdAmount >= 1000000) {
        return `$${Math.round(usdAmount / 1000000)}M`;
      }
      return `$${Math.round(usdAmount / 1000)}K`;
    }
    return `$${Math.round(usdAmount).toLocaleString()}`;
  }

  return formatRSC({ amount, shorten });
};
