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
export function formatUsdValue(amount: string, exchangeRate: number): string {
  const parsedAmount = parseFloat(amount);
  const usdValue = parsedAmount * exchangeRate;
  const absValue = Math.abs(usdValue).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${usdValue < 0 ? '-$' : '$'}${absValue} USD`;
}
