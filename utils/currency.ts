import { formatRSC } from './number';

interface FormatCurrencyOptions {
  amount: number;
  showUSD: boolean;
  exchangeRate: number;
  shorten?: boolean;
}

export const formatCurrency = ({
  amount,
  showUSD,
  exchangeRate,
  shorten = false,
}: FormatCurrencyOptions): string => {
  if (showUSD && exchangeRate > 0) {
    const usdAmount = amount * exchangeRate;
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
