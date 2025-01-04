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
    const formatted = shortened.endsWith('.0') 
      ? shortened.slice(0, -2) 
      : shortened;
    return `${formatted}K`;
  }

  return amount.toString();
}
