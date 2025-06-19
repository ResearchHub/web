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
        return `$${(usdAmount / 1000000).toFixed(1)}M`;
      }
      return `$${(usdAmount / 1000).toFixed(1)}K`;
    }
    return `$${usdAmount.toFixed(2)}`;
  }

  return formatRSC({ amount, shorten });
};
