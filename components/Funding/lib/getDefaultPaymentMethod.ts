import { type PaymentMethodType } from './constants';
import { type WalletAvailability } from './useWalletAvailability';

/**
 * Determine the default payment method based on user's balance and
 * actual wallet availability (from Stripe's canMakePayment check).
 *
 * Priority:
 * 1. RSC - if user has enough balance (including fees)
 * 2. Apple Pay - if available on this device (takes priority; Stripe renders it preferentially on Apple devices)
 * 3. Google Pay - if available on this device
 * 4. Credit Card - fallback
 *
 * Returns `null` when wallet availability is still being checked and RSC
 * balance is insufficient — the caller should show "Select a payment method"
 * until the check resolves (typically < 200ms).
 *
 * @param rscBalance - User's current RSC balance
 * @param amountInRsc - Amount in RSC needed for the transaction
 * @param platformFeePercent - Platform fee percentage (e.g., 7)
 * @param walletAvailability - Device wallet capabilities from useWalletAvailability
 * @returns The recommended default payment method, or null if still determining
 */
export function getDefaultPaymentMethod(
  rscBalance: number,
  amountInRsc: number,
  platformFeePercent: number,
  walletAvailability: WalletAvailability
): PaymentMethodType | null {
  // Calculate RSC amount including platform fee (RSC has no processing fee)
  const rscAmountWithFees = amountInRsc * (1 + platformFeePercent / 100);

  // If user has enough RSC, default to RSC (synchronous, no waiting needed)
  if (rscBalance >= rscAmountWithFees) {
    return 'rsc';
  }

  // Still checking wallet availability — don't commit yet
  if (walletAvailability.checking) {
    return null;
  }

  // Apple Pay takes priority (Stripe renders it preferentially on Apple devices)
  if (walletAvailability.applePay) {
    return 'apple_pay';
  }

  // Google Pay
  if (walletAvailability.googlePay) {
    return 'google_pay';
  }

  // Fallback to credit card
  return 'credit_card';
}
