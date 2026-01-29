import { type PaymentMethodType } from './constants';

/**
 * Determine the default payment method based on user's balance and browser.
 *
 * Priority:
 * 1. RSC - if user has enough balance (including fees)
 * 2. Apple Pay - if user is on Safari (mobile or desktop)
 * 3. Credit Card - fallback
 *
 * @param rscBalance - User's current RSC balance
 * @param amountInRsc - Amount in RSC needed for the transaction
 * @param platformFeePercent - Platform fee percentage (e.g., 9)
 * @param isSafari - Whether the browser is Safari
 * @returns The recommended default payment method
 */
export function getDefaultPaymentMethod(
  rscBalance: number,
  amountInRsc: number,
  platformFeePercent: number,
  isSafari: boolean
): PaymentMethodType {
  // Calculate RSC amount including platform fee (RSC has no processing fee)
  const rscAmountWithFees = amountInRsc * (1 + platformFeePercent / 100);

  // If user has enough RSC, default to RSC
  if (rscBalance >= rscAmountWithFees) {
    return 'rsc';
  }

  // If Safari (Apple Pay available), default to Apple Pay
  if (isSafari) {
    return 'apple_pay';
  }

  // Otherwise, default to credit card
  return 'credit_card';
}
