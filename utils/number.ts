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
 */
export function formatRSC({ amount, shorten = false }: FormatRSCOptions): string {
  if (!shorten) {
    return amount.toLocaleString();
  }

  if (amount >= 1000) {
    const shortened = (amount / 1000).toFixed(1);
    // Remove .0 if present
    const formatted = shortened.endsWith('.0') ? shortened.slice(0, -2) : shortened;
    return `${formatted}K`;
  }

  // For small numbers when shortening is true but amount < 1000
  return amount.toLocaleString('en-US', {
    maximumFractionDigits: 1,
  });
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
export function formatUsdValue(amount: string, exchangeRate: number): string {
  const parsedAmount = parseFloat(amount);
  const usdValue = parsedAmount * exchangeRate;
  const absValue = Math.abs(usdValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${usdValue < 0 ? '-$' : '$'}${absValue} USD`;
}
