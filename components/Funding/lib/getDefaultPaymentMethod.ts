import { type PaymentMethodType } from './constants';
import { type WalletAvailability } from './useWalletAvailability';

/**
 * Determine the default payment method based on the user's balances and
 * actual wallet availability (from Stripe's canMakePayment check).
 *
 * Priority:
 * 1. Funding Credits — if the user's locked balance covers the contribution
 * 2. RSC - if user has enough spendable balance (including fees)
 * 3. Apple Pay - if available on this device
 * 4. Google Pay - if available on this device
 * 5. Credit Card - fallback
 *
 * Returns `null` when wallet availability is still being checked and neither
 * RSC-based method can cover the amount.
 */
export function getDefaultPaymentMethod(
  rscBalance: number,
  lockedBalance: number,
  amountInRsc: number,
  platformFeePercent: number,
  walletAvailability: WalletAvailability
): PaymentMethodType | null {
  const rscAmountWithFees = amountInRsc * (1 + platformFeePercent / 100);

  if (lockedBalance >= rscAmountWithFees) {
    return 'funding_credits';
  }

  if (rscBalance >= rscAmountWithFees) {
    return 'rsc';
  }

  if (walletAvailability.checking) {
    return null;
  }

  if (walletAvailability.applePay) {
    return 'apple_pay';
  }

  if (walletAvailability.googlePay) {
    return 'google_pay';
  }

  return 'credit_card';
}
