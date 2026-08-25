/** Compact USD for campaign cards: 25000 -> $25K, 33600 -> $33.6K, 900 -> $900. */
export function formatGoal(usd: number): string {
  if (usd >= 1000) {
    const k = usd / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `$${usd.toLocaleString('en-US')}`;
}
