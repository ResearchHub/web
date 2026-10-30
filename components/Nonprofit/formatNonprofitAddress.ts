import { NonprofitAddress } from '@/types/nonprofit';

/**
 * Formats a nonprofit address as "line1, city, state zip, country", skipping missing parts
 */
export function formatNonprofitAddress(address?: NonprofitAddress): string {
  if (!address) return '';

  const stateZip = [address.state, address.zip].filter(Boolean).join(' ');

  return [address.line1, address.city, stateZip, address.country].filter(Boolean).join(', ');
}
