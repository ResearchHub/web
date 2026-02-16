interface FormatRSCOptions {
  /**
   * The number to format
   */
  amount: number;
  /**
   * Whether to shorten numbers >= 1000 with K suffix
   * @default false
   */
  shorten?: boolean;
  /**
   * Whether to round the number to the nearest integer (remove decimal places)
   * @default false
   */
  round?: boolean;
  /**
   * The number of decimal places to format to.
   * This is ignored if `shorten` is true.
   */
  decimalPlaces?: number;
}

/**
 * Formats a number as RSC amount, optionally shortening it with K suffix
 * @param options Formatting options
 * @returns Formatted string
 *
 * @example
 * formatRSC({ amount: 1234, shorten: true }) // "1.2K"
 * formatRSC({ amount: 1000, shorten: true }) // "1K"
 * formatRSC({ amount: 433 }) // "433"
 * formatRSC({ amount: 1234 }) // "1,234"
 * formatRSC({ amount: 1234.567, round: true }) // "1,235"
 * formatRSC({ amount: 65.102, decimalPlaces: 2 }) // "65.10"
 */
export function formatRSC({
  amount,
  shorten = false,
  round = false,
  decimalPlaces,
}: FormatRSCOptions): string {
  // Round the amount if requested
  const valueToFormat = round ? Math.round(amount) : amount;

  if (shorten) {
    if (valueToFormat >= 1_000_000) {
      // Handles millions and above
      const millions = valueToFormat / 1_000_000;
      let formattedMillions = millions.toFixed(1);
      if (formattedMillions.endsWith('.0')) {
        formattedMillions = formattedMillions.slice(0, -2);
      }
      return `${formattedMillions}M`;
    } else if (valueToFormat >= 1_000) {
      // Handles thousands (1,000 to 999,999)
      const thousands = valueToFormat / 1_000;
      let formattedThousands = thousands.toFixed(1);
      if (formattedThousands.endsWith('.0')) {
        formattedThousands = formattedThousands.slice(0, -2);
      }
      return `${formattedThousands}K`;
    } else {
      // For values less than 1,000
      return valueToFormat.toString();
    }
  }

  if (decimalPlaces !== undefined) {
    return valueToFormat.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }

  // shorten is false
  return valueToFormat.toLocaleString();
}

/**
 * Formats a transaction amount with a + or - prefix and RSC suffix
 * @param amount The amount to format
 * @returns Formatted string with RSC suffix
 *
 * @example
 * formatTransactionAmount("10500.5") // "+10,500.50 RSC"
 * formatTransactionAmount("-5000") // "-5,000 RSC"
 */
export function formatTransactionAmount(amount: string): string {
  const parsedAmount = parseFloat(amount);
  const formattedAmount = parsedAmount.toLocaleString('en-US', {
    minimumFractionDigits: parsedAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${parsedAmount >= 0 ? '+' : ''}${formattedAmount} RSC`;
}

/**
 * Formats a USD value with $ prefix
 * @param amount The amount in RSC
 * @param exchangeRate The current RSC to USD exchange rate
 * @returns Formatted USD string
 *
 * @example
 * formatUsdValue("10500.5", 0.5) // "$5,250.25 USD"
 */
export function formatUsdValue(
  amount: string,
  exchangeRate: number,
  useExchangeRate = true
): string {
  const parsedAmount = parseFloat(amount);
  const usdValue = useExchangeRate ? parsedAmount * exchangeRate : parsedAmount;
  const absValue = Math.abs(usdValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${usdValue < 0 ? '-$' : '$'}${absValue} USD`;
}

interface BalanceData {
  formatted: string;
  formattedUsd: string;
  raw: number;
}

/**
 * Extracts the exchange rate from balance data
 * @param balance Optional balance data
 * @param lockedBalance Optional locked balance data
 * @returns The calculated exchange rate or 0 if cannot be determined
 */
export function extractExchangeRate(
  balance: BalanceData | null,
  lockedBalance: BalanceData | null
): number {
  if (balance?.raw && balance.raw > 0) {
    const balanceUsd = parseFloat(
      balance.formattedUsd?.replace('$', '').replace(' USD', '').replace(/,/g, '') || '0'
    );
    return balanceUsd / balance.raw;
  } else if (lockedBalance?.raw && lockedBalance.raw > 0) {
    const lockedUsd = parseFloat(
      lockedBalance.formattedUsd?.replace('$', '').replace(' USD', '').replace(/,/g, '') || '0'
    );
    return lockedUsd / lockedBalance.raw;
  }
  return 0;
}

interface FormatCombinedBalanceOptions {
  balance: BalanceData | null;
  lockedBalance: BalanceData | null;
  showUSD: boolean;
  includeRSCSuffix?: boolean;
}

/**
 * Formats the combined balance (available + locked) in the preferred currency
 * @param options Formatting options
 * @returns Formatted string in the preferred currency
 */
export function formatCombinedBalance({
  balance,
  lockedBalance,
  showUSD,
  includeRSCSuffix = true,
}: FormatCombinedBalanceOptions): string {
  const totalRaw = (balance?.raw || 0) + (lockedBalance?.raw || 0);

  if (showUSD) {
    const exchangeRate = extractExchangeRate(balance, lockedBalance);
    return exchangeRate > 0 ? formatUsdValue(totalRaw.toString(), exchangeRate) : '$0.00';
  } else {
    const formatted = formatRSC({ amount: totalRaw });
    return includeRSCSuffix ? `${formatted} RSC` : formatted;
  }
}

/**
 * Gets the secondary currency display for combined balance
 * @param options Formatting options
 * @returns Formatted string in the secondary currency
 */
export function formatCombinedBalanceSecondary({
  balance,
  lockedBalance,
  showUSD,
}: FormatCombinedBalanceOptions): string {
  const totalRaw = (balance?.raw || 0) + (lockedBalance?.raw || 0);

  if (showUSD) {
    // Secondary is RSC when primary is USD
    return `${formatRSC({ amount: totalRaw })} RSC`;
  } else {
    // Secondary is USD when primary is RSC
    const exchangeRate = extractExchangeRate(balance, lockedBalance);
    return exchangeRate > 0 ? formatUsdValue(totalRaw.toString(), exchangeRate) : '$0.00 USD';
  }
}

/**
 * Formats a USD amount with compact notation for large numbers
 * @param amount The amount in USD
 * @returns Formatted string with $ prefix
 *
 * @example
 * formatUsdCompact(1234) // "$1,234"
 * formatUsdCompact(12345) // "$12,345"
 * formatUsdCompact(123456) // "$123K"
 * formatUsdCompact(1234567) // "$1.2M"
 * formatUsdCompact(1234567890) // "$1.2B"
 */
export function formatUsdCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  }
  if (amount >= 100_000) {
    return `$${(amount / 1_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
  }
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Formats a number with locale-specific thousand separators
 * @param num The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
